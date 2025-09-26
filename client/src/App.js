import React, { useEffect, useState, useCallback } from 'react';
import './App.css';
import StatsDashboard from './StatsDashboard';
const API_BASE = '/api';

function App() {
  const [tasks, setTasks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  // Corrected initial category to ensure it's a known value
  const [newTaskCategory, setNewTaskCategory] = useState('other'); 
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ==========================================================
  // 1. DARK MODE STATE: Initialize by checking Local Storage
  const initialTheme = localStorage.getItem('theme') === 'dark';
  const [isDarkMode, setIsDarkMode] = useState(initialTheme);
  // ==========================================================
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [showStats, setShowStats] = useState(false);
  // add a new states for searching and filtering tasks
  const [searchText, setSearchText] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  // 1. Categories vom Backend laden
  const getCategories = async () => {
    try {
      const response = await fetch(`${API_BASE}/GetCategories`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      // Ensure 'other' category is present if no categories are fetched or if the backend returns no categories.
      // This helps with the default value of newTaskCategory.
      const defaultCategories = data.length > 0 ? data : [{ id: 'other', name: 'Other', color: '#95a5a6' }];
      setCategories(defaultCategories);
    } catch (e) {
      console.log('Error fetching categories');
      // Set a fallback category in case of error
      setCategories([{ id: 'other', name: 'Other', color: '#95a5a6' }]); 
    }
  };

  // 2. Aufgaben vom Backend laden
  const getTasks = async (status, query) => {
    setLoading(true);
    setError(null);
    try {
      const url = new URL(`${window.location.origin}${API_BASE}/GetTasks`);
      // Add filter by status
      if (status && status !== 'all') {
        url.searchParams.append('isCompleted', status === 'completed');
      }
      // Add search by text
      if (query && query.trim() !== '') {
        url.searchParams.append('q', query.trim());
      }
      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      setTasks(data);
    } catch (err) {
      setError('Failed to fetch tasks.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get category info
  const getCategoryInfo = (categoryId) => {
    // If a task's category is not found, default to a fallback.
    return categories.find(cat => cat.id === categoryId) || { name: categoryId, color: '#95a5a6' }; 
  };

  // ==========================================================
  // 2. TOGGLE DARK MODE: Updates state AND DOM (The missing link)
  const toggleDarkMode = () => {
    setIsDarkMode(prevMode => !prevMode);
  };

  // 3. USE EFFECT FOR DARK MODE: Applies theme attribute on state change
  useEffect(() => {
    const rootElement = document.documentElement; // Targets the <html> tag
    if (isDarkMode) {
        rootElement.setAttribute('data-theme', 'dark');
        localStorage.setItem('theme', 'dark');
    } else {
        rootElement.removeAttribute('data-theme');
        localStorage.setItem('theme', 'light');
    }
  }, [isDarkMode]);
  // ==========================================================

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
    if (notificationsEnabled && 'Notification' in window) { // Check if enabled before showing
        new Notification(title, { body, icon: '/favicon.ico', ...options });
    }
  }, [notificationsEnabled]);


  // Check for upcoming deadlines
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
          showNotification('Urgent Task Reminder', `"${task.title}" is due in 1 hour!`, { tag: `urgent-${task.id}` });
        }
      }
    });
  }, [tasks, notificationsEnabled, showNotification]);

  // Toggle notifications
  const toggleNotifications = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        // Only show notification if permission was just granted
        // showNotification('Notifications Enabled', 'You will receive task reminders'); 
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
  }, [tasks, notificationsEnabled, checkDeadlines]);

  // Debounced effect for search and filter
  useEffect(() => {
    const handler = setTimeout(() => {
      getTasks(filterStatus, searchText);
    }, 500);
    return () => clearTimeout(handler);
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
        getTasks(filterStatus, searchText); // Refresh tasks with current filters
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
        getTasks(filterStatus, searchText); // Re-fetch all tasks after deletion
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
        getTasks(filterStatus, searchText); // Re-fetch tasks after update
      } else {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }
    } catch (e) {
      console.error(`Error updating task ${task.id}:`, e);
      setError('Could not update the task.');
    }
  };

  // 6. Filtered tasks based on all filters
  const filteredTasks = tasks
    .filter(task => selectedCategory === 'all' || task.category === selectedCategory)
    .filter(task => filterStatus === 'all' || (filterStatus === 'completed' ? task.isCompleted : !task.isCompleted))
    .filter(task => searchText.trim() === '' || task.title.toLowerCase().includes(searchText.toLowerCase()));

  return (
    // NOTE: Removed the redundant 'dark-mode' class here. The CSS should target the [data-theme="dark"] on the <html> tag, which is managed by the useEffect hook.
    // The class `App` itself is enough for the base styles.
    <div className={`App`}> 
      <header className="App-header">
        <h1>Produktivitäts-Assistent</h1>
        
        {/* Dark Mode Toggle Button */}
        <button className="dark-mode-toggle" onClick={toggleDarkMode}>
          {isDarkMode ? '☀️ Light' : '🌙 Dark'}
        </button>
        
        {/* Notification Toggle Button */}
        <button className="notification-toggle" onClick={toggleNotifications} title={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}>
          {notificationsEnabled ? '🔔' : '🔕'}
        </button>
        
        <button className="stats-toggle" onClick={() => setShowStats(!showStats)} style={{ position: 'absolute', top: '20px', right: '140px' }}>
          {showStats ? '📊 Hide Stats' : '📊 Stats'}
        </button>
        
        <form onSubmit={addTask} className="task-adder">
          {/* Input fields */}
          <input className="task-input" type="text" placeholder="New Task..." value={newTaskTitle} onChange={(e) => setNewTaskTitle(e.target.value)} />
          <input className="task-input" type="date" value={newTaskDueDate} onChange={(e) => setNewTaskDueDate(e.target.value)} />
          
          {/* Category Select for NEW TASK */}
          <select className="task-input" value={newTaskCategory} onChange={(e) => setNewTaskCategory(e.target.value)}>
            {categories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
          </select>
          <button type="submit">Hinzufügen</button>
        </form>
        
        <div className="category-filter">
          <label>Filter: </label>
          {/* Category Filter Select */}
          <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
            <option value="all">All Categories</option>
            {categories.map(category => (<option key={category.id} value={category.id}>{category.name}</option>))}
          </select>
        </div>
        
        <div className="search-filter-container">
          <input type="text" placeholder="Search tasks..." value={searchText} onChange={(e) => setSearchText(e.target.value)} />
          <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">All</option>
            <option value="completed">Completed</option>
            <option value="remaining">Remaining</option>
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
                  <input type="checkbox" checked={task.isCompleted} onChange={() => toggleTaskCompletion(task)} />
                  <div className="task-details">
                    <span>{task.title}</span>
                    <span className="category-badge" style={{ backgroundColor: categoryInfo.color }}>
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
      <StatsDashboard tasks={tasks} categories={categories} stats={calculateStats()} showStats={showStats} onClose={() => setShowStats(false)} />
    </div>
  );
}

export default App;