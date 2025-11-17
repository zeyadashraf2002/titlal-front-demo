// frontend/src/pages/worker/Login.jsx - UNIFIED with Client Login
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { Flower2, Users, UserCircle } from 'lucide-react';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import LanguageSwitcher from '../../components/common/LanguageSwitcher';
import { clientsAPI } from '../../services/api';

const Login = () => {
  const { t } = useTranslation();
  const { login } = useAuth();
  const navigate = useNavigate();
  
  // ✅ NEW: Login Type Selection
  const [loginType, setLoginType] = useState('staff'); // 'staff' or 'client'
  
  const [credentials, setCredentials] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Staff Login (Admin/Worker)
  const handleStaffLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(credentials);
    
    if (result.success) {
      if (result.user.role === 'admin') {
        navigate('/admin');
      } else if (result.user.role === 'worker') {
        navigate('/worker');
      }
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  // ✅ Client Login
  const handleClientLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await clientsAPI.clientLogin({
        email: credentials.email,
        password: credentials.password
      });
      
      if (response.data.success) {
        const { token, client, isPasswordTemporary } = response.data.data;
        
        // Store token and client data
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify({ ...client, role: 'client' }));
        
        // Redirect
        if (isPasswordTemporary) {
          navigate('/client/change-password');
        } else {
          navigate('/client/dashboard');
        }
      }
    } catch (err) {
      console.error('Client login error:', err);
      setError(err.response?.data?.message || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = loginType === 'staff' ? handleStaffLogin : handleClientLogin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="absolute top-4 right-4">
        <LanguageSwitcher />
      </div>
      
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
        {/* Logo & Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Flower2 className="w-10 h-10 text-primary-600" />
          </div>
          <h1 className="text-4xl font-bold text-primary-600 mb-2">🌿 Garden MS</h1>
          <p className="text-gray-600">{t('common.login')}</p>
        </div>

        {/* ✅ Login Type Selector */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => {
              setLoginType('staff');
              setError('');
            }}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              loginType === 'staff'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <Users className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-medium">Staff Login</span>
            <p className="text-xs text-gray-500 mt-1">Admin / Worker</p>
          </button>

          <button
            onClick={() => {
              setLoginType('client');
              setError('');
            }}
            className={`flex-1 p-3 rounded-lg border-2 transition-all ${
              loginType === 'client'
                ? 'border-primary-600 bg-primary-50 text-primary-700'
                : 'border-gray-200 text-gray-600 hover:border-gray-300'
            }`}
          >
            <UserCircle className="w-5 h-5 mx-auto mb-1" />
            <span className="text-sm font-medium">Client Login</span>
            <p className="text-xs text-gray-500 mt-1">Customer Portal</p>
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label={t('auth.email')}
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
            placeholder="Enter your email"
            required
          />
          
          <Input
            label={t('auth.password')}
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
            placeholder="Enter your password"
            required
          />

          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {loginType === 'staff' && (
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input type="checkbox" className="mr-2" />
                <span className="text-sm text-gray-600">{t('auth.rememberMe')}</span>
              </label>
              <a href="#" className="text-sm text-primary-600 hover:text-primary-700">
                {t('auth.forgotPassword')}
              </a>
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? t('common.loading') : t('common.login')}
          </Button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-6 text-center text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
          <p className="font-semibold mb-2">Demo Credentials:</p>
          {loginType === 'staff' ? (
            <>
              <p>Admin: admin@garden.com / admin123</p>
              <p>Worker: worker@garden.com / worker123</p>
            </>
          ) : (
            <p>Client: john.doe@example.com / demo123</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;