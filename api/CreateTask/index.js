module.exports = async function (context, req) {
  const task = req.body;

  if (!task || !task.title) {
    context.res = {
      status: 400,
      body: "Task title is required"
    };
    return;
  }

  // Normalerweise würde hier in Cosmos DB speichern
  const newTask = {
    id: Date.now(),
    title: task.title,
    completed: false
  };

  context.res = {
    status: 201,
    body: newTask
  };
};
