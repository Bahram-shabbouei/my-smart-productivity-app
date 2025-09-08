import { app } from "@azure/functions";
import store from "./tasksStore.js";

// GET /api/GetTasks
app.http("GetTasks", {
  route: "GetTasks",
  methods: ["GET"],
  authLevel: "anonymous",
  handler: async (_request, _context) => {
    const tasks = store.list();
    return { status: 200, jsonBody: tasks };
  },
});

// POST /api/CreateTask
app.http("CreateTask", {
  route: "CreateTask",
  methods: ["POST"],
  authLevel: "anonymous",
  handler: async (request, _context) => {
    const body = (await request.json().catch(() => ({}))) || {};
    if (!body.title || typeof body.title !== "string") {
      return { status: 400, jsonBody: { message: "Task title is required" } };
    }
    const newTask = store.create(body.title, body.description || "");
    return { status: 201, jsonBody: newTask };
  },
});

// PUT /api/UpdateTask/{id}
app.http("UpdateTask", {
  route: "UpdateTask/{id}",
  methods: ["PUT"],
  authLevel: "anonymous",
  handler: async (request, _context) => {
    const { id } = request.params;
    const patchRaw = (await request.json().catch(() => ({}))) || {};
    const patch = {};
    if (typeof patchRaw.title === "string") patch.title = patchRaw.title;
    if (typeof patchRaw.description === "string") patch.description = patchRaw.description;
    if (typeof patchRaw.isCompleted === "boolean") patch.isCompleted = patchRaw.isCompleted;

    const updated = store.update(id, patch);
    if (!updated) return { status: 404, jsonBody: { message: `Task ${id} not found` } };
    return { status: 200, jsonBody: updated };
  },
});

// DELETE /api/DeleteTask/{id}
app.http("DeleteTask", {
  route: "DeleteTask/{id}",
  methods: ["DELETE"],
  authLevel: "anonymous",
  handler: async (request, _context) => {
    const { id } = request.params;
    if (!id) return { status: 400, jsonBody: { message: "Task ID is required" } };
    const removed = store.remove(id);
    if (!removed) return { status: 404, jsonBody: { message: `Task ${id} not found` } };
    return { status: 200, jsonBody: { message: `Task ${id} deleted` } };
  },
});
