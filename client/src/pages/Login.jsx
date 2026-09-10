import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { login, register, googleLogin } from '../features/auth/authSlice';

// Pesan toast berdasarkan alasan redirect dari ProtectedRoute
// (mis. akses langsung ke /watchlist tanpa login).
const REASON_MESSAGES = {
  watchlist: 'Please login to view your watchlist.',
  profile: 'Please login to view your profile.',
  auth: 'Please login to continue.',
}

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { loading, error } = useSelector((state) => state.auth);

  // ProtectedRoute menitipkan { from, reason } lewat location.state.
  const from = location.state?.from || '/';
  const reasonMessage = location.state?.reason ? REASON_MESSAGES[location.state.reason] : null;

  const handleAuthSuccess = () => {
    // Kembali ke halaman asal kalau ada (mis. /watchlist), kalau tidak ke home.
    navigate(from, { replace: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (isRegister) {
      result = await dispatch(register(name, email, password));
    } else {
      result = await dispatch(login(email, password));
    }

    if (result.success) {
      handleAuthSuccess();
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await dispatch(googleLogin(credentialResponse.credential));
    if (result.success) {
      handleAuthSuccess();
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign In failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-base-100 rounded-xl p-8 border border-base-300 shadow-lg">
          <h1 className="text-2xl font-bold text-base-content text-center mb-6">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>

          {reasonMessage && !error && (
            <div className="alert alert-warning mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 shrink-0" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{reasonMessage}</span>
            </div>
          )}

          {error && (
            <div className="alert alert-error mb-4">
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label className="label">
                  <span className="label-text text-base-content/70">Name</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                  placeholder="Your name"
                  required
                />
              </div>
            )}

            <div>
              <label className="label">
                <span className="label-text text-base-content/70">Email</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                placeholder="your@email.com"
                required
              />
            </div>

            <div>
              <label className="label">
                <span className="label-text text-base-content/70">Password</span>
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input input-bordered w-full bg-base-200 border-base-300 text-base-content"
                placeholder="Min. 5 characters"
                required
                minLength={5}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full bg-gradient-to-r from-emerald-500 to-cyan-500 border-0 text-white"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : isRegister ? (
                'Register'
              ) : (
                'Login'
              )}
            </button>
          </form>

          <div className="divider text-base-content/40 my-6">OR</div>

          <div className="flex justify-center w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="outline"
              shape="pill"
              text="continue_with"
              width={320}
            />
          </div>

          <p className="text-center text-base-content/60 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-600 hover:underline"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
