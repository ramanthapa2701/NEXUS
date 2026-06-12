import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const [name, setName] = useState('');
  const [type, setType] = useState('numeric');
  const [goalValue, setGoalValue] = useState('');
  const [weight, setWeight] = useState(10);
  const [logValues, setLogValues] = useState({});
  const navigate = useNavigate();

  const fetchHabits = async () => {
    try {
      const res = await api.get('/habits');
      setHabits(res.data);
    } catch (err) {
      navigate('/login');
    }
  };

  useEffect(() => {
    fetchHabits();
  }, []);

  const handleAddHabit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/habits', {
        name,
        type,
        goal_value: type === 'numeric' ? Number(goalValue) : null,
        weight: Number(weight),
      });
      setName('');
      setGoalValue('');
      setWeight(10);
      fetchHabits();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to add habit');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this habit?')) return;
    try {
      await api.delete(`/habits/${id}`);
      fetchHabits();
    } catch (err) {
      alert('Failed to delete');
    }
  };

  const handleLog = async (habit) => {
    const today = new Date().toISOString().split('T')[0];
    try {
      if (habit.type === 'numeric') {
        const value = logValues[habit.id];
        if (value === undefined || value === '') return alert('Enter a value');
        await api.post(`/habits/${habit.id}/log`, { log_date: today, value: Number(value) });
      } else {
        await api.post(`/habits/${habit.id}/log`, { log_date: today, completed: true });
      }
      alert('Logged successfully!');
    } catch (err) {
      alert('Failed to log');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">NEXUS Dashboard</h1>
        <button onClick={handleLogout} className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600">
          Logout
        </button>
      </div>

      {/* Add Habit Form */}
      <form onSubmit={handleAddHabit} className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-3 items-end">
        <div>
          <label className="block text-sm mb-1">Habit Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 rounded"
            required
          />
        </div>
        <div>
          <label className="block text-sm mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value)} className="border p-2 rounded">
            <option value="numeric">Numeric</option>
            <option value="binary">Binary</option>
          </select>
        </div>
        {type === 'numeric' && (
          <div>
            <label className="block text-sm mb-1">Goal Value</label>
            <input
              type="number"
              value={goalValue}
              onChange={(e) => setGoalValue(e.target.value)}
              className="border p-2 rounded w-24"
              required
            />
          </div>
        )}
        <div>
          <label className="block text-sm mb-1">Weight</label>
          <input
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="border p-2 rounded w-20"
          />
        </div>
        <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Add Habit
        </button>
      </form>

      {/* Habits List */}
      <h2 className="text-xl font-semibold mb-3">Your Habits</h2>
      <div className="grid gap-3">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <div>
              <span className="font-medium">{habit.name}</span>
              <span className="text-sm text-gray-500 ml-3">
                {habit.type} {habit.type === 'numeric' && `| Goal: ${habit.goal_value}`} | Weight: {habit.weight}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {habit.type === 'numeric' ? (
                <input
                  type="number"
                  placeholder="Today's value"
                  className="border p-1 rounded w-28"
                  value={logValues[habit.id] || ''}
                  onChange={(e) => setLogValues({ ...logValues, [habit.id]: e.target.value })}
                />
              ) : null}
              <button
                onClick={() => handleLog(habit)}
                className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
              >
                {habit.type === 'numeric' ? 'Log' : 'Mark Done'}
              </button>
              <button
                onClick={() => handleDelete(habit.id)}
                className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
        {habits.length === 0 && <p className="text-gray-500">No habits yet.</p>}
      </div>
    </div>
  );
}

export default Dashboard;