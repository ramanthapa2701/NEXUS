import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

function Dashboard() {
  const [habits, setHabits] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchHabits = async () => {
      try {
        const res = await api.get('/habits');
        setHabits(res.data);
      } catch (err) {
        navigate('/login');
      }
    };
    fetchHabits();
  }, []);

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

      <h2 className="text-xl font-semibold mb-3">Your Habits</h2>
      <div className="grid gap-3">
        {habits.map((habit) => (
          <div key={habit.id} className="bg-white p-4 rounded shadow flex justify-between items-center">
            <span className="font-medium">{habit.name}</span>
            <span className="text-sm text-gray-500">{habit.type} | Goal: {habit.goal_value} | Weight: {habit.weight}</span>
          </div>
        ))}
        {habits.length === 0 && <p className="text-gray-500">No habits yet.</p>}
      </div>
    </div>
  );
}

export default Dashboard;