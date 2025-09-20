const { CosmosClient } = require("@azure/cosmos");

const connectionString = process.env.CosmosDbConnectionString;
const databaseId = "TodoDb";
const containerId = "Tasks";

const cosmosClient = new CosmosClient(connectionString);
const database = cosmosClient.database(databaseId);
const container = database.container(containerId);

module.exports = async function (context, req) {
    try {
        const { resources: tasks } = await container.items.readAll().fetchAll();
        context.res = {
            status: 200,
            body: tasks
        };
    } catch (error) {
        context.log('Error fetching GetTasks:', error);
        context.res = {
            status: 500,
            body: { message: "Error fetching tasks from database." }
        };
    }
};