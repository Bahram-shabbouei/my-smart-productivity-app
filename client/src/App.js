import React, { useEffect, useState } from 'react';
import './App.css';

const API_BASE = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Aufgaben vom Backend laden
  const getTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/GetTasks`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTasks(data);
    } catch (e) {
      console.log('Error fetching tasks');
      setError('Could not load tasks.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getTasks();
  }, []);

  // 2. Eine neue Aufgabe hinzufügen
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/CreateTask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, description: 'New Task', dueDate: newTaskDueDate || null }),
      });
      if (response.ok) {
        setNewTaskTitle('');
        setNewTaskDueDate('');
        getTasks(); // Liste neu laden, um die neue Aufgabe anzuzeigen
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }
    } catch (e) {
      console.error('Error adding task:', e);
      setError(`Could not add the task: ${e.message}`);
    }
  };

  // 3. Eine Aufgabe löschen
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/DeleteTask/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        setTasks(tasks.filter(task => task.id !== id));
      } else {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
    } catch (e) {
      console.error(`Error deleting task ${id}:`, e);
      setError('Could not delete the task.');
    }
  };

  // 4. Den Status einer Aufgabe aktualisieren (Erledigt/Offen)
  const toggleTaskCompletion = async (task) => {
    try {
      const response = await fetch(`${API_BASE}/UpdateTask/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, isCompleted: !task.isCompleted }),
      });
      if (response.ok) {
        // Optimistisches Update: Aktualisiere den Zustand sofort im Frontend
        setTasks(tasks.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));
      } else {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }
    } catch (e) {
      console.error(`Error updating task ${task.id}:`, e);
      setError('Could not update the task.');
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Produktivitäts-Assistent</h1>
        <form onSubmit={addTask} className="task-adder">
          <input
            className="task-input"
            type="text"
            placeholder="Neue Aufgabe..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
          />
          <input
            className="task-input"
            type="date"
            value={newTaskDueDate}
            onChange={(e) => setNewTaskDueDate(e.target.value)}
          />
          <button type="submit">Hinzufügen</button>
        </form>

        {error && <p className="error-message">{error}</p>}

        <ul className="task-list">
          {loading ? (
            <li>Lade Aufgaben...</li>
          ) : (
            tasks.map(task => (
              <li key={task.id} className={task.isCompleted ? 'completed' : ''}>
                <input
                  type="checkbox"
                  checked={task.isCompleted}
                  onChange={() => toggleTaskCompletion(task)}
                />
                <div className="task-details">
                  <span>{task.title}</span>
                  {task.dueDate && <small>Fällig am: {new Date(task.dueDate).toLocaleDateString()}</small>}
                </div>
                <button className="delete-btn" onClick={() => deleteTask(task.id)}>
                  Löschen
                </button>
              </li>
            ))
          )}
        </ul>
      </header>
    </div>
  );
}

export default App;