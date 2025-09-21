import React, { useEffect, useState } from 'react';
import './App.css';

const API_BASE = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('other');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
const [isDarkMode, setIsDarkMode] = useState(false);  

  // 1. Categories vom Backend laden
  const getCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/GetCategories`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setCategories(data);
    } catch (e) {
      console.log('Error fetching categories');
    }
  };

  // 2. Aufgaben vom Backend laden
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
    getCategories();
    getTasks();
  }, []);

  // 3. Eine neue Aufgabe hinzufügen
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    try {
      const response = await fetch(`${API_BASE}/CreateTask`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          title: newTaskTitle, 
          description: 'New Task', 
          dueDate: newTaskDueDate || null,
          category: newTaskCategory 
        }),
      });
      if (response.ok) {
        setNewTaskTitle('');
        setNewTaskDueDate('');
        setNewTaskCategory('other');
        getTasks();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create task');
      }
    } catch (e) {
      console.error('Error adding task:', e);
      setError(`Could not add the task: ${e.message}`);
    }
  };

  // 4. Eine Aufgabe löschen
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

  // 5. Den Status einer Aufgabe aktualisieren
  const toggleTaskCompletion = async (task) => {
    try {
      const response = await fetch(`${API_BASE}/UpdateTask/${task.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...task, isCompleted: !task.isCompleted }),
      });
      if (response.ok) {
        setTasks(tasks.map(t => t.id === task.id ? { ...t, isCompleted: !t.isCompleted } : t));
      } else {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }
    } catch (e) {
      console.error(`Error updating task ${task.id}:`, e);
      setError('Could not update the task.');
    }
  };

  // 6. Filtered tasks basierend auf ausgewählter Kategorie
  const filteredTasks = selectedCategory === 'all' 
    ? tasks 
    : tasks.filter(task => task.category === selectedCategory);

  // 7. Get category info
  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: categoryId, color: '#95a5a6' };
  };

  // Toggle dark mode
const toggleDarkMode = () => {
  setIsDarkMode(!isDarkMode);
};
  return (
    <div className={`App ${isDarkMode ? 'dark-mode' : ''}`}>
      <header className="App-header">
        <h1>Produktivitäts-Assistent</h1>
        <button 
  className="dark-mode-toggle" 
  onClick={toggleDarkMode}
>
  {isDarkMode ? '☀️ Light' : '🌙 Dark'}
</button>
        
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
          <select
            className="task-input"
            value={newTaskCategory}
            onChange={(e) => setNewTaskCategory(e.target.value)}
          >
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
          <button type="submit">Hinzufügen</button>
        </form>

        {/* Category Filter */}
        <div className="category-filter">
          <label>Filter: </label>
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
          >
            <option value="all">Alle Kategorien</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="error-message">{error}</p>}

        <ul className="task-list">
          {loading ? (
            <li>Lade Aufgaben...</li>
          ) : (
            filteredTasks.map(task => {
              const categoryInfo = getCategoryInfo(task.category);
              return (
                <li key={task.id} className={task.isCompleted ? 'completed' : ''}>      
                  <input
                    type="checkbox"
                    checked={task.isCompleted}
                    onChange={() => toggleTaskCompletion(task)}
                  />
                  <div className="task-details">
                    <span>{task.title}</span>
                    <span 
                      className="category-badge" 
                      style={{ backgroundColor: categoryInfo.color }}
                    >
                      {categoryInfo.name}
                    </span>
                    {task.dueDate && <small>Fällig am: {new Date(task.dueDate).toLocaleDateString()}</small>}
                  </div>
                  <button className="delete-btn" onClick={() => deleteTask(task.id)}>   
                    Löschen
                  </button>
                </li>
              );
            })
          )}
        </ul>
      </header>
    </div>
  );
}

export default App;