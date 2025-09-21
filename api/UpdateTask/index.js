const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.CosmosDbConnectionString;
const databaseId = "TodoDb";
const containerId = "Tasks";

const cosmosClient = new CosmosClient(connectionString);
const database = cosmosClient.database(databaseId);
const container = database.container(containerId);

module.exports = async function (context, req) {
    try {
        const taskId = req.params.id;
        const updatedData = req.body;

        // 1. Aufgabe aus der Datenbank holen
        const { resource: taskToUpdate } = await container.item(taskId, taskId).read();
        if (!taskToUpdate) {
            context.res = {
                status: 404,
                body: { message: `Task with id ${taskId} not found.` }
            };
            return;
        }

        // 2. Felder aktualisieren
        taskToUpdate.title = updatedData.title ?? taskToUpdate.title;
        taskToUpdate.description = updatedData.description ?? taskToUpdate.description;
        taskToUpdate.isCompleted = updatedData.isCompleted ?? taskToUpdate.isCompleted;
        taskToUpdate.dueDate = updatedData.dueDate ?? taskToUpdate.dueDate;
        taskToUpdate.category = updatedData.category ?? taskToUpdate.category;

        // 3. Aktualisierte Aufgabe speichern
        const { resource: updatedTask } = await container.item(taskId, taskId).replace(taskToUpdate);

        context.res = {
            status: 200,
            body: updatedTask
        };
    } catch (error) {
        context.log("ERROR: in UpdateTask:", error);
        context.res = {
            status: 500,
            body: { message: "Error updating task in database." }
        };
    }
};