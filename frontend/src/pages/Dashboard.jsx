import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaCheckCircle, FaRegCircle, FaPlus, FaSignOutAlt, FaTasks, FaTrashAlt } from 'react-icons/fa';
import { FiSun, FiMoon } from 'react-icons/fi';
import API from '../api';
import '../App.css';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const username = localStorage.getItem('nexus_username') || 'User';
  const navigate = useNavigate();

  // Theme state restoration engine
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('nexus_user_theme');
    return savedTheme === 'dark';
  });

  // Task Creation Wizard States
  const [newText, setNewText] = useState('');
  const [newType, setNewType] = useState('checkbox');
  const [newTarget, setNewTarget] = useState('0');
  const [newUnit, setNewUnit] = useState('liters');

  // Input log mapping dictionaries
  const [logInputs, setLogInputs] = useState({});

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayName = daysOfWeek[new Date().getDay()];

  // Theme Sync Effect
  useEffect(() => {
    if (darkMode) {
      document.documentElement.setAttribute('data-theme', 'dark');
      localStorage.setItem('nexus_user_theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
      localStorage.setItem('nexus_user_theme', 'light');
    }
  }, [darkMode]);

  useEffect(() => {
    fetchUserTasks();
  }, []);

  const fetchUserTasks = async () => {
    try {
      setLoading(true);
      setError('');
      const response = await API.get('/tasks');
      setTasks(response.data);
    } catch (err) {
      setError('Failed to fetch tasks from the database server.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // SEMI-AUTOMATIC WIZARD ENGINE (Intelligent input parsing listeners)
  const handleTaskTextChange = (textValue) => {
    setNewText(textValue);
    const lowerText = textValue.toLowerCase();

    if (lowerText.includes("water") || lowerText.includes("drink") || lowerText.includes("hydration")) {
      setNewType("quantity");
      setNewUnit("liters");
      setNewTarget("3");
    } 
    else if (lowerText.includes("step") || lowerText.includes("walk") || lowerText.includes("distance") || lowerText.includes("running")) {
      setNewType("quantity");
      setNewUnit("steps");
      setNewTarget("10000");
    }
    else if (lowerText.includes("protein") || lowerText.includes("calories") || lowerText.includes("diet")) {
      setNewType("quantity");
      setNewUnit("grams");
      setNewTarget("140");
    }
    else if (lowerText.includes("sleep") || lowerText.includes("rest")) {
      setNewType("time");
      setNewUnit("hours");
      setNewTarget("8");
    }
    else if (lowerText.includes("code") || lowerText.includes("project") || lowerText.includes("nexus") || lowerText.includes("build")) {
      setNewType("time");
      setNewUnit("hours");
      setNewTarget("2");
    }
    else if (lowerText.includes("study") || lowerText.includes("exam") || lowerText.includes("preparation") || lowerText.includes("lecture")) {
      setNewType("time");
      setNewUnit("hours");
      setNewTarget("3");
    }
    else if (lowerText.includes("read") || lowerText.includes("book") || lowerText.includes("pages")) {
      setNewType("quantity");
      setNewUnit("pages");
      setNewTarget("20");
    }
    else if (lowerText.includes("gym") || lowerText.includes("workout") || lowerText.includes("weightlifting") || lowerText.includes("wake") || lowerText.includes("shower") || lowerText.includes("meditation")) {
      setNewType("checkbox");
      setNewTarget("0");
      setNewUnit("");
    }
  };

  // DYNAMIC COMPILATION RADIAL METRIC ENGINE
  const calculateOverallProgress = () => {
    const todaysTasks = tasks.filter(task => task.assignedDays && task.assignedDays.includes(todayName));
    if (todaysTasks.length === 0) return 0;

    let totalPercentagePool = 0;
    todaysTasks.forEach(task => {
      if (task.type === 'checkbox') {
        totalPercentagePool += task.completed ? 100 : 0;
      } else {
        const target = parseFloat(task.target) || 1;
        const current = parseFloat(task.current) || 0;
        totalPercentagePool += Math.min((current / target) * 100, 100);
      }
    });

    return Math.round(totalPercentagePool / todaysTasks.length);
  };

  const overallProgress = calculateOverallProgress();

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newText.trim()) return;
    setError('');

    try {
      const payload = {
        text: newText,
        type: newType, // Guaranteed lowercase select values pass perfectly
        target: newType === 'checkbox' ? 0 : parseFloat(newTarget) || 0,
        unit: newType === 'checkbox' ? '' : (newType === 'time' ? 'hours' : newUnit),
        assignedDays: [todayName]
      };

      const response = await API.post('/tasks', payload);
      setTasks([...tasks, response.data]);
      
      // Clean up form inputs
      setNewText('');
      setNewType('checkbox');
      setNewTarget('0');
      setNewUnit('liters');
    } catch (err) {
      console.error(err);
      setError('Could not initialize tracking entry.');
    }
  };

  // ADVANCED LOG PARSING ENGINE FOR HOURS, MINUTES, AND QUANTITIES
  const handleLogProgress = async (taskId, targetVal) => {
    const inputVal = logInputs[taskId];
    if (!inputVal) return;

    const targetTask = tasks.find(t => t.id === taskId);
    if (!targetTask) return;

    let addedValue = 0;

    if (targetTask.type === 'time') {
      const lowerInput = inputVal.toLowerCase().trim();
      
      const hourMatch = lowerInput.match(/(\d+(\.\d+)?)\s*h/);
      const minMatch = lowerInput.match(/(\d+)\s*m/);

      if (hourMatch || minMatch) {
        const hours = hourMatch ? parseFloat(hourMatch[1]) : 0;
        const minutes = minMatch ? parseFloat(minMatch[1]) : 0;
        addedValue = hours + (minutes / 60); 
      } else if (!isNaN(lowerInput)) {
        addedValue = parseFloat(lowerInput); 
      } else {
        return; 
      }
    } else {
      if (isNaN(inputVal)) return;
      addedValue = parseFloat(inputVal);
    }

    const newCurrent = Math.min((parseFloat(targetTask.current) || 0) + addedValue, targetVal);
    const isNowCompleted = newCurrent >= targetVal;

    try {
      const response = await API.patch(`/tasks/${taskId}`, {
        current: Number(newCurrent.toFixed(2)), 
        completed: isNowCompleted
      });
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
      setLogInputs({ ...logInputs, [taskId]: '' });
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleCheckbox = async (taskId, currentCompletedState) => {
    try {
      const response = await API.patch(`/tasks/${taskId}`, {
        completed: !currentCompletedState
      });
      setTasks(tasks.map(t => t.id === taskId ? response.data : t));
    } catch (err) {
      console.error(err);
    }
  };

  // HANDLE TASK DELETE PIPELINES
  const handleDeleteTask = async (taskId) => {
    try {
      await API.delete(`/tasks/${taskId}`);
      setTasks(prevTasks => prevTasks.filter(t => t.id !== taskId));
    } catch (err) {
      console.error('Error erasing task entry:', err);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('nexus_user_token');
    localStorage.removeItem('nexus_username');
    navigate('/login');
  };

  const todaysTasks = tasks.filter(task => task.assignedDays && task.assignedDays.includes(todayName));

  return (
    <div className="nexus-dashboard">
      {/* Dark Mode Floating Trigger Node */}
      <div className="theme-toggle-container">
        <button className="theme-btn" onClick={() => setDarkMode(!darkMode)}>
          {darkMode ? <><FiSun size={16} /> Light Mode</> : <><FiMoon size={16} /> Dark Mode</>}
        </button>
      </div>

      <header className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <div>
          <h1 style={{ margin: 0, color: 'var(--text-accent)' }}>NEXUS Engine Workspace</h1>
          <p style={{ margin: 0, color: 'var(--text-muted)' }}>Welcome back, <strong>{username}</strong></p>
        </div>
        <button onClick={handleLogout} className="logout-btn" style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#d32f2f', color: '#fff', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>
          <FaSignOutAlt /> Leave Session
        </button>
      </header>

      {error && <div style={{ background: '#ffebee', color: '#c62828', padding: '12px', borderRadius: '6px', marginBottom: '20px' }}>{error}</div>}

      <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        
        {/* PANEL A: RADIAL PROGRESS DISPLAY */}
        <section className="task-form-panel" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <div className="panel-title-wrapper" style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div className="accent-bar" style={{ width: '4px', height: '20px', background: 'var(--accent-color)' }}></div>
            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Current Active Tasks Tracking</h3>
          </div>

          <h4 style={{ color: 'var(--text-accent)', margin: '0 0 5px 0' }}>{todayName}</h4>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: '0 0 25px 0' }}>
            {new Date().toLocaleDateString('de-DE')} (Today)
          </p>

          <div className="progress-box" style={{ width: '160px', height: '160px' }}>
            <svg style={{ transform: 'rotate(-90deg)', width: '100%', height: '100%' }}>
              <circle cx="80" cy="80" r="70" stroke="var(--progress-bg)" strokeWidth="12" fill="transparent" />
              <circle
                cx="80"
                cy="80"
                r="70"
                stroke="var(--accent-color)"
                strokeWidth="12"
                fill="transparent"
                strokeDasharray={439.8}
                strokeDashoffset={439.8 - (439.8 * overallProgress) / 100}
                style={{ transition: 'stroke-dashoffset 0.4s ease-in-out' }}
              />
            </svg>
            <div className="percentage-overlay" style={{ fontSize: '1.8rem', color: 'var(--text-main)' }}>
              {overallProgress}%
            </div>
          </div>

          <div style={{ marginTop: '20px', background: 'var(--bg-app)', padding: '10px 20px', borderRadius: '20px', fontSize: '0.9rem', fontWeight: 'bold', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}>
            Tasks Log Status Meter
          </div>
        </section>

        {/* PANEL B: OBJECTIVES CHECKLIST MATRIX */}
        <section className="task-form-panel">
          <div className="panel-title-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <div className="accent-bar" style={{ width: '4px', height: '20px', background: 'var(--accent-color)' }}></div>
            <h3 style={{ margin: 0, color: 'var(--text-main)' }}>Target Metrics Checklist</h3>
          </div>

          {loading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading records from server database...</p>
          ) : todaysTasks.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No objectives active for today.</p>
          ) : (
            <div className="task-list" style={{ maxHeight: '320px', overflowY: 'auto' }}>
              {todaysTasks.map(task => (
                <div key={task.id} className="task-block" style={{ borderBottom: '1px dashed var(--border-color)', paddingBottom: '12px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                      {task.type === 'checkbox' ? (
                        <div onClick={() => handleToggleCheckbox(task.id, task.completed)} style={{ cursor: 'pointer', color: task.completed ? 'var(--accent-color)' : 'var(--text-muted)', fontSize: '1.2rem', display: 'flex', alignItems: 'center' }}>
                          {task.completed ? <FaCheckCircle /> : <FaRegCircle />}
                        </div>
                      ) : (
                        <span className="type-badge">{task.type}</span>
                      )}
                      <span className={`task-text ${task.completed ? 'completed' : ''}`} style={{ fontSize: '0.95rem', fontWeight: '500' }}>
                        {task.text}
                      </span>
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                      {task.type !== 'checkbox' && (
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                          {task.current} / {task.target} {task.unit}
                        </span>
                      )}
                      <button 
                        onClick={() => handleDeleteTask(task.id)}
                        style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
                        title="Delete Task"
                        onMouseEnter={(e) => e.currentTarget.style.color = '#b91c1c'}
                        onMouseLeave={(e) => e.currentTarget.style.color = '#ef4444'}
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </div>
                  </div>

                  {task.type !== 'checkbox' && (
                    <div style={{ marginTop: '8px', paddingRight: '25px' }}>
                      <div className="sub-progress-bar-container" style={{ marginBottom: '8px' }}>
                        <div className="sub-progress-bar-fill" style={{ width: `${Math.min(((task.current || 0) / (task.target || 1)) * 100, 100)}%` }}></div>
                      </div>
                      {!task.completed && (
                        <div className="quantity-control-row">
                          <input
                            type="text" 
                            className="inline-log-input"
                            placeholder={task.type === 'time' ? 'e.g., 1h 30m or 45m' : `Add ${task.unit}`}
                            value={logInputs[task.id] || ''}
                            onChange={(e) => setLogInputs({ ...logInputs, [task.id]: e.target.value })}
                          />
                          <button onClick={() => handleLogProgress(task.id, task.target)} className="inline-log-btn">Log</button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid var(--border-color)', margin: '20px 0' }} />

          {/* COMPACT AUTO-WIZARD DEPLOYMENT PANEL FORM */}
          <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', color: 'var(--text-main)' }}><FaTasks /> Deploy Fresh Objective Template</h4>
            <p className="auto-detect-hint" style={{ margin: 0 }}>💡 Typing keywords likes 'water' or 'sleep' configures targets automatically.</p>
            
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px' }}>
              <input
                type="text"
                className="custom-input"
                placeholder="E.g., Drink Water or Gym Workout"
                value={newText}
                onChange={(e) => handleTaskTextChange(e.target.value)}
                required
              />
              <select className="custom-select" value={newType} onChange={(e) => setNewType(e.target.value)}>
                <option value="checkbox">Checkbox Style</option>
                <option value="time">Time Blocks</option>
                <option value="quantity">Quantifiable Metrics</option>
              </select>
            </div>

            {newType !== 'checkbox' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div className="form-group">
                  <label style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Target Goal Amount</label>
                  <input
                    type="number"
                    className="custom-input"
                    value={newTarget}
                    onChange={(e) => setNewTarget(e.target.value)}
                    required
                  />
                </div>
                {newType === 'quantity' && (
                  <div className="form-group">
                    <label style={{ fontSize: '0.8rem', color: 'var(--text-main)' }}>Unit Metric</label>
                    <select className="custom-select" value={newUnit} onChange={(e) => setNewUnit(e.target.value)}>
                      <option value="liters">Liters (Water)</option>
                      <option value="steps">Steps (Movement)</option>
                      <option value="grams">Grams (Nutrition)</option>
                      <option value="pages">Pages (Reading)</option>
                      <option value="quantity">Quantity (Count)</option>
                      <option value="km">Kilometers (Distance)</option>
                    </select>
                  </div>
                )}
              </div>
            )}

            <button type="submit" className="submit-task-btn" style={{ margin: 0, padding: '10px' }}>
              <FaPlus /> Initialize Target Tracking Matrix
            </button>
          </form>

        </section>
      </div>
    </div>
  );
}

export default Dashboard;