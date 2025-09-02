
module.exports = async function (context, req) {
    // Dies ist eine Beispielliste, später kommt das aus Cosmos DB
    const exampleTasks = [
        { id: "1", title: "Milch kaufen", isCompleted: false },
        { id: "2", title: "Auto waschen", isCompleted: true },
        { id: "3", title: "Azure CLI lernen", isCompleted: false }
    ];

    context.res = {
        status: 200,
        body: exampleTasks
    };
};