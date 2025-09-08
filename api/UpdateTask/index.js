module.exports = async function (context, req) {
    const id = context.bindingData.id;
    const updatedTaskData = req.body;

    context.log(`UpdateTask function processed a request for task Id: ${id}`);
    
    // In einer echten App würden Sie hier die Aufgabe in der Datenbank suchen und aktualisieren.
    // Wir geben nur eine Erfolgsmeldung zurück.
    context.res = {
        status: 200,
        body: { message: `Task ${id} was updated.` }
    };
};