// src/StatsDashboard.js
import React from 'react';
import './StatsDashboard.css';

function StatsDashboard({ tasks, categories, stats, showStats, onClose }) {
  if (!showStats) return null; // وقتی showStats = false باشه چیزی نشون نمی‌ده

  return (
    <div className="stats-dashboard">
      <h2>📊 Aufgaben-Statistik</h2>

      <div className="stat-item">
        <strong>Gesamtaufgaben:</strong> {stats.totalTasks}
      </div>
      <div className="stat-item">
        <strong>Erledigt:</strong> {stats.completedTasks}
      </div>
      <div className="stat-item">
        <strong>Überfällig:</strong> {stats.overdueTasks}
      </div>
      <div className="stat-item">
        <strong>Erledigungsrate:</strong> {stats.completionRate}%
      </div>

      <h3>Kategorien</h3>
      <ul>
        {stats.categoryBreakdown.map(cat => (
          <li key={cat.id}>
            <span style={{ color: cat.color, fontWeight: 'bold' }}>●</span>{' '}
            {cat.name}: {cat.completed}/{cat.count} erledigt
          </li>
        ))}
      </ul>

      <button onClick={onClose}>Schließen</button>
    </div>
  );
}

export default StatsDashboard;
