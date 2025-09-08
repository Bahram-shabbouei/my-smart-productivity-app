// Simple in-memory task store for local development.
// In production replace with Cosmos DB data access.
let tasks = [
  { id: 1, title: "Buy milk", description: "From the supermarket", isCompleted: false },
  { id: 2, title: "Wash the car", description: "On the weekend", isCompleted: true },
  { id: 3, title: "Practice elevator pitch", description: "For the job interview", isCompleted: false }
];

function list() {
  return tasks;
}

function create(title, description = "") {
  const task = { id: Date.now(), title, description, isCompleted: false };
  tasks.push(task);
  return task;
}

function remove(id) {
  const before = tasks.length;
  tasks = tasks.filter(t => t.id !== Number(id));
  return before !== tasks.length;
}

function update(id, patch) {
  const task = tasks.find(t => t.id === Number(id));
  if (!task) return null;
  Object.assign(task, patch);
  return task;
}

export default { list, create, remove, update };
