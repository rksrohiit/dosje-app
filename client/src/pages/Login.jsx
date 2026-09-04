import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogIn, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const demoUsers = [
    { label: '🔑 Admin (DoSJE)', email: 'admin@dosje.gov.in', password: 'Admin@123' },
    { label: '🔍 PMU Inspector', email: 'inspector@pmu.gov.in', password: 'Pmu@123' },
    { label: '🏢 NGO Manager', email: 'manager@ngo1.org', password: 'Ngo@123' },
    { label: '🔧 Field Worker', email: 'worker@ngo1.org', password: 'Worker@123' },
    { label: '👤 Beneficiary', email: 'beneficiary@test.com', password: 'Ben@123' },
  ];

  const handleLogin = async (e, demoEmail, demoPass) => {
    if (e) e.preventDefault();
    const targetEmail = demoEmail || email;
    const targetPass = demoPass || password;

    if (!targetEmail || !targetPass) {
      toast.error('Please enter email and password');
      return;
    }

    setIsLoading(true);
    try {
      const resData = await login(targetEmail, targetPass);
      toast.success('Login successful!');
      const role = resData?.user?.role;
      if (role === 'ngo') {
        navigate('/ngo-dashboard');
      } else if (role === 'field_worker') {
        navigate('/field-verification');
      } else if (role === 'beneficiary') {
        navigate('/beneficiary-portal');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Login failed. Please check credentials or backend server.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoClick = (user) => {
    setEmail(user.email);
    setPassword(user.password);
    handleLogin(null, user.email, user.password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-indigo-800 to-purple-900 p-4">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gray-50 p-6 text-center border-b border-gray-200">
          <div className="text-5xl mb-2">🇮🇳</div>
          <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-1">Government of India</h2>
          <h1 className="text-sm font-semibold text-gray-800">Ministry of Social Justice & Empowerment</h1>
        </div>
        
        <div className="p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-6">DoSJE Monitoring Platform</h3>
          
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your email"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                placeholder="Enter your password"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <LogIn className="w-5 h-5" />}
              Secure Login
            </button>
          </form>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">1-Click Demo Login</span>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {demoUsers.map((u) => (
                <button
                  key={u.email}
                  type="button"
                  onClick={() => handleDemoClick(u)}
                  className="text-xs font-medium py-2.5 px-3 border border-gray-300 rounded-lg hover:bg-blue-50 hover:border-blue-400 text-gray-700 transition-colors text-center"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
