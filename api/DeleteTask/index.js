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
        await container.item(taskId, taskId).delete();
        context.res = {
            status: 200,
            body: { message: `Task ${taskId} deleted successfully.` }
        };
    } catch (error) {
        if (error.code === 404) {
            context.res = {
                status: 404,
                body: { message: `Task with id ${taskId} not found.` }
            };
            return;
        }
        context.log("ERROR: in DeleteTask:", error);
        context.res = {
            status: 500,
            body: { message: "Error deleting task from database." }
        };
    }
};