import React, { useEffect, useState, useCallback, use } from 'react';
import './App.css';
import StatsDashboard from './StatsDashboard';
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
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showStats, setShowStats] = useState(false);
  //add a new states for searching and filtering tasks
const [searchText, setsearchText] = useState('');
const [filterStatus, setfilterStatus] = useState('all');

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
  // chenge functoin to include search and filter logic
  const getTasks = async () => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${apiBaseUrl}/tasks`);
      //add filter by status
      if (filter.status && filter.status !== 'all'){
        url.searchParams.append('isCompleted', filter-status === 'completed');
      }
      //add search by text
      if (filter.q && filter.q.trim() !== ''){
        url.searchParams.append('q', filter.q.trim());
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setErrorMassage('Failed to fetch tasks.');
      console.error('err');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category info
  const getCategoryInfo = (categoryId) => {
    return categories.find(cat => cat.id === categoryId) || { name: categoryId, color: '#95a5a6' };
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  // Request notification permission
  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      setNotificationsEnabled(permission === 'granted');
      return permission === 'granted';
    }
    return false;
  };

  // Show notification
  const showNotification = useCallback((title, body, options = {}) => {
    if ('Notification' in window) {
      new Notification(title, { body, icon: '/favicon.ico',
        ...options
      });
    }
  }, []); //Note dependencies are now empty

  // Check for upcoming deadlines - Using useCallback for better performance
  const checkDeadlines = useCallback(() => {
    if (!notificationsEnabled) return;
    const now = new Date();
    tasks.forEach(task => {
      if (task.dueDate && !task.isCompleted) {
        const dueDate = new Date(task.dueDate);
      const hoursUntilDue = (dueDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntilDue <= 24 && hoursUntilDue > 23) {
          showNotification('Task Reminder', `"${task.title}" is due tomorrow`, { tag: `reminder-${task.id}` });
        }

        if (hoursUntilDue <= 1 && hoursUntilDue > 0) {
          showNotification('Urgent Task Reminder',`"${task.title}" is due in 1 hour!`, { tag: `urgent-${task.id}` });
        }
      }
    });
}, [tasks, notificationsEnabled]); // Added showNotification to dependencies

  // Toggle notifications
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        showNotification('Notifications Enabled', 'You will receive task reminders');
      }
    } else {
      setNotificationsEnabled(false);
    }
  };

// Calculate statistics
const calculateStats = useCallback(() => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  
  const overdueTasks = tasks.filter(task => {
    if (task.isCompleted || !task.dueDate) return false;
    return new Date(task.dueDate) < today;
  }).length;
  
  const categoryBreakdown = categories.map(category => {
    const categoryTasks = tasks.filter(task => task.category === category.id);
    return {
      ...category,
      count: categoryTasks.length,
      completed: categoryTasks.filter(task => task.isCompleted).length
    };
  }).filter(cat => cat.count > 0);
  
  return {
    totalTasks,
    completedTasks,
    completionRate,
    overdueTasks,
    categoryBreakdown
  };
}, [tasks, categories]);

  // Initial data fetch
  useEffect(() => {
    getCategories();
    getTasks();
  }, []);

  // Check deadlines periodically
  useEffect(() => {
    if (notificationsEnabled && tasks.length > 0) {
      checkDeadlines();
      const interval = setInterval(checkDeadlines, 30 * 60 * 1000); // 30 minutes
      return () => clearInterval(interval);
    }
  }, [tasks, notificationsEnabled, checkDeadlines]); // Note: checkDeadlines is a dependency now

  useEffect(() => {
    const handler = setTimeout(() => {
      //this function will be called 500ms after the state stops changing
      getTasks({status: filterStatus, q: searchText});
    }, 500);
    return () => clearTimeout(handler); //cleanup function to cancel the previos timer
  }, [searchText, filterStatus]);
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
        <button
          className="notification-toggle"
          onClick={toggleNotifications}
          title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
        >
          {notificationsEnabled ? '🔔' : '🔕'}
        </button>
        <button
  className="stats-toggle"
  onClick={() => setShowStats(!showStats)}
  style={{
    position: 'absolute',
    top: '20px',
    right: '140px'
  }}
>
  {showStats ? '📊 Hide Stats' : '📊 Stats'}
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
        <div className="search-filter-container">
  <input
    type="text"
    placeholder="Search tasks..."
    value={searchText}
    onChange={(e) => setSearchText(e.target.value)}
  />
  <select
    value={filterStatus}
    onChange={(e) => setFilterStatus(e.target.value)}
  >
    <option value="all">All</option>
    <option value="completed">Completed</option>
    <option value="remaining">Remaining</option>
  </select>
</div>

{/* The error message comes next */}
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

      {/* Statistics Dashboard Component*/}
      <StatsDashboard
        tasks={tasks}
        categories={categories}
        stats={calculateStats()}
        showStats={showStats}
        onClose={()=> setShowStats(false)}
      />
    </div>
  );
}

export default App;