import React from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import './Dashboard.css';

// Register necessary Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

const Dashboard = ({ tasks, categories, showStats, onClose }) => {
  // Don't render if the dashboard is not visible
  if (!showStats) {
    return null;
  }

  // Calculate task statistics
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.isCompleted).length;
  const remainingTasks = totalTasks - completedTasks;

  // Prepare data for the pie chart
  const categoryCounts = tasks.reduce((acc, task) => {
    acc[task.category] = (acc[task.category] || 0) + 1;
    return acc;
  }, {});

  const categoryNames = Object.keys(categoryCounts).map(
    (categoryId) => categories.find(cat => cat.id === categoryId)?.name || categoryId
  );

  const data = {
    labels: categoryNames,
    datasets: [
      {
        data: Object.values(categoryCounts),
        backgroundColor: Object.keys(categoryCounts).map(
          (categoryId) => categories.find(cat => cat.id === categoryId)?.color || '#95a5a6'
        ),
        borderColor: '#fff',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Task Distribution by Category',
      },
    },
  };

  return (
    <div className="dashboard-container">
      <button className="close-btn" onClick={onClose}>&times;</button>
      <h2>Your Progress at a Glance</h2>
      <div className="stats-grid">
        <div className="stat-card total">
          <h3>Total Tasks</h3>
          <p>{totalTasks}</p>
        </div>
        <div className="stat-card completed">
          <h3>Completed</h3>
          <p>{completedTasks}</p>
        </div>
        <div className="stat-card remaining">
          <h3>Remaining</h3>
          <p>{remainingTasks}</p>
        </div>
      </div>
      <div className="chart-container">
        {totalTasks > 0 ? (
          <Pie data={data} options={options} />
        ) : (
          <p>No tasks to display yet.</p>
        )}
      </div>
    </div>
  );
};

export default Dashboard;