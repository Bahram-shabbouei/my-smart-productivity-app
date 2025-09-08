module.exports = async function (context, req) {
  context.log('HTTP trigger function processed a request.');

    // This is sample data. Later, this will come from our Cosmos DB database.
    const tasks = [
        { id: 1, title: "Buy milk", description: "From the supermarket", isCompleted: false },
        { id: 2, title: "Wash the car", description: "On the weekend", isCompleted: true },
        { id: 3, title: "Practice elevator pitch", description: "For the job interview", isCompleted: false }
    ];

    context.res = {
        status: 200, /* Defaults to 200 */
        body: tasks,
        headers: {
            'Content-Type': 'application/json'
        }
    };
};