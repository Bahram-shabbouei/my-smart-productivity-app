// Importieren der notwendigen Bibliotheken
const { app } = require("@azure/functions");
const { CosmosClient } = require("@azure/cosmos");

// Sichere Verbindung zur Cosmos DB über Umgebungsvariablen
// Diese werden wir später in Azure setzen.
const connectionString = process.env.CosmosDbConnectionString;
const databaseId = "TodoDb";
const containerId = "Tasks";

const cosmosClient = new CosmosClient(connectionString);
const database = cosmosClient.database(databaseId);
const container = database.container(containerId);


// GET: Alle Aufgaben abrufen
app.http("GetTasks", {
    route: "GetTasks",
    methods: ["GET"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        try {
            const { resources: tasks } = await container.items.readAll().fetchAll();
            return { status: 200, jsonBody: tasks };
        } catch (error) {
          context.log('Error fetching GetTasks:', error);
            return { status: 500, jsonBody: { message: "Error fetching tasks from database." } };
        }
    },
});

// POST: Eine neue Aufgabe erstellen
app.http("CreateTask", {
    route: "CreateTask",
    methods: ["POST"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        try {
            const body = await request.json();
            if (!body.title || typeof body.title !== "string") {
                return { status: 400, jsonBody: { message: "Task title is required and must be a string." } };
            }

            const newTask = {
                title: body.title,
                description: body.description || "", // Standardwert, falls keine Beschreibung vorhanden ist
                isCompleted: false,
                dueDate: body.dueDate || null, // Speichert das Fälligkeitsdatum
                // Wichtig: Wir generieren eine einzigartige ID
                id: new Date().toISOString() + Math.random().toString().substring(2, 10)
            };

            const { resource: createdTask } = await container.items.create(newTask);
            return { status: 201, jsonBody: createdTask };
        } catch (error) {
            context.log("ERROR: in creatTask:", error);
            return { status: 500, jsonBody: { message: "Error creating task in database." } };
        }
    },
});

// PUT: Eine Aufgabe aktualisieren (z.B. Status oder Fälligkeitsdatum ändern)
app.http("UpdateTask", {
    route: "UpdateTask/{id}",
    methods: ["PUT"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        try {
            const taskId = request.params.id;
            const updatedData = await request.json();

            // 1. Aufgabe aus der Datenbank holen
            const { resource: taskToUpdate } = await container.item(taskId, taskId).read();
            if (!taskToUpdate) {
                return { status: 404, jsonBody: { message: `Task with id ${taskId} not found.` } };
            }

            // 2. Felder aktualisieren, die im Request Body vorhanden sind
            taskToUpdate.title = updatedData.title ?? taskToUpdate.title;
            taskToUpdate.description = updatedData.description ?? taskToUpdate.description;
            taskToUpdate.isCompleted = updatedData.isCompleted ?? taskToUpdate.isCompleted;
            taskToUpdate.dueDate = updatedData.dueDate ?? taskToUpdate.dueDate;

            // 3. Aktualisierte Aufgabe in der Datenbank speichern
            const { resource: updatedTask } = await container.item(taskId, taskId).replace(taskToUpdate);
            
            return { status: 200, jsonBody: updatedTask };
        } catch (error) {
            context.log("ERROR: in UpdateTask:", error);
            return { status: 500, jsonBody: { message: "Error updating task in database." } };
        }
    },
});

// DELETE: Eine Aufgabe löschen
app.http("DeleteTask", {
    route: "DeleteTask/{id}",
    methods: ["DELETE"],
    authLevel: "anonymous",
    handler: async (request, context) => {
        try {
            const taskId = request.params.id;
            await container.item(taskId, taskId).delete();
            return { status: 200, jsonBody: { message: `Task ${taskId} deleted successfully.` } };
        } catch (error) {
            if (error.code === 404) {
                return { status: 404, jsonBody: { message: `Task with id ${taskId} not found.` } };
            }
            context.log("ERROR: some message");
            return { status: 500, jsonBody: { message: "Error deleting task from database." } };
        }
    },
});