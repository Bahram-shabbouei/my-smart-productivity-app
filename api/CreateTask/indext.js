module.exports = async function (context, req) {
    const newTask = req.body;
    context.log('Neue Aufgabe empfangen:', newTask.title);
    
    // Später speichern wir das in Cosmos DB. Jetzt simulieren wir nur einen Erfolg.
    
    context.res = {
        status: 201, // 201 Created
        body: { message: "Aufgabe erfolgreich erstellt", task: newTask }
    };
};