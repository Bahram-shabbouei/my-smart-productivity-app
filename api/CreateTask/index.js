const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.CosmosDbConnectionString;
const databaseId = "TodoDb";
const containerId = "Tasks";

const cosmosClient = new CosmosClient(connectionString);
const database = cosmosClient.database(databaseId);
const container = database.container(containerId);

module.exports = async function (context, req) {
    try {
        const body = req.body;
        if (!body.title || typeof body.title !== "string") {
            context.res = {
                status: 400,
                body: { message: "Task title is required and must be a string." }
            };
            return;
        }

        const newTask = {
            title: body.title,
            description: body.description || "",
            isCompleted: false,
            dueDate: body.dueDate || null,
            id: new Date().toISOString() + Math.random().toString().substring(2, 10)
        };

        const { resource: createdTask } = await container.items.create(newTask);
        context.res = {
            status: 201,
            body: createdTask
        };
    } catch (error) {
        context.log("ERROR: in CreateTask:", error);
        context.res = {
            status: 500,
            body: { message: "Error creating task in database." }
        };
    }
};