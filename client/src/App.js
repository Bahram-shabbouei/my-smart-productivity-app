import React, { useEffect, useState } from 'react';
import './App.css';

// Die API-Basis ist relativ zum Host. Die SWA CLI (und später Azure) leitet /api automatisch an das Backend weiter.
const API_BASE = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 1. Lade die Aufgaben beim ersten Start der App
  useEffect(() => {
    getTasks();
  }, []);

  const getTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${API_BASE}/GetTasks`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTasks(data);
    } catch (e) {
      console.error('Error fetching tasks:', e);
      setError('Could not load tasks. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // 2. Füge eine neue Aufgabe hinzu
  const addTask = async () => {
    if (!newTaskTitle.trim()) return; // Nichts tun, wenn das Feld leer ist

    try {
      const response = await fetch(`${API_BASE}/CreateTask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle, description: 'New Task' }),
      });

      if (response.ok) {
        const createdTask = await response.json();
        // Füge die neue Aufgabe zur Liste hinzu, um die Ansicht zu aktualisieren
        setTasks([...tasks, createdTask]);
        setNewTaskTitle(''); // Setze das Eingabefeld zurück
      } else {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }
    } catch (e) {
      console.error('Error adding task:', e);
      setError('Could not add the task.');
    }
  };

  // 3. Lösche eine Aufgabe
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/DeleteTask/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        // Entferne die gelöschte Aufgabe aus der Liste, um die Ansicht zu aktualisieren
        setTasks(tasks.filter(task => task.id !== id));
      } else {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }
    } catch (e) {
      console.error(`Error deleting task ${id}:`, e);
      setError('Could not delete the task.');
    }
  };
  
  return (
    <div className="App">
      <header className="App-header">
        <h1>Produktivitäts-Assistent</h1>

        {/* Formular zum Hinzufügen von Aufgaben */}
        <div className="task-adder">
          <input
            type="text"
            placeholder="Neue Aufgabe..."
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addTask()}
          />
          <button onClick={addTask}>Hinzufügen</button>
        </div>

        {error && <p className="error-message">{error}</p>}

        {/* Aufgabenliste */}
        <ul className="task-list">
          {loading ? (
            <li>Lade Aufgaben...</li>
          ) : (
            tasks.map(task => (
              <li key={task.id} className={task.isCompleted ? 'completed' : ''}>
                <span>{task.title}</span>
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