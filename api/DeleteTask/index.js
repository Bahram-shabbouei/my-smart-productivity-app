module.exports = async function (context, req) {
  const id = context.bindingData.id;

  if (!id) {
    context.res = {
      status: 400,
      body: "Task ID is required"
    };
    return;
  }

  // Hier würdest du aus Cosmos DB löschen
  context.res = {
    status: 200,
    body: { message: `Task ${id} deleted` }
  };
};
