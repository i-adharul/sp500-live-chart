import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { GoogleLogin } from '@react-oauth/google';
import { login, register, googleLogin } from '../features/auth/authSlice';

export default function Login() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);

  const handleSubmit = async (e) => {
    e.preventDefault();

    let result;
    if (isRegister) {
      result = await dispatch(register(name, email, password));
    } else {
      result = await dispatch(login(email, password));
    }

    if (result.success) {
      navigate('/');
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    const result = await dispatch(googleLogin(credentialResponse.credential));
    if (result.success) {
      navigate('/');
    }
  };

  const handleGoogleError = () => {
    console.error('Google Sign In failed');
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-base-200 rounded-xl p-8 border border-base-300">
          <h1 className="text-2xl font-bold text-white text-center mb-6">
            {isRegister ? 'Create Account' : 'Welcome Back'}
          </h1>

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
                  className="input input-bordered w-full bg-base-300 border-base-300 text-white"
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
                className="input input-bordered w-full bg-base-300 border-base-300 text-white"
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
                className="input input-bordered w-full bg-base-300 border-base-300 text-white"
                placeholder="Min. 5 characters"
                required
                minLength={5}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary w-full bg-gradient-to-r from-emerald-500 to-cyan-500 border-0"
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

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={handleGoogleError}
              theme="filled_black"
              shape="pill"
              text="continue_with"
              width="100%"
            />
          </div>

          <p className="text-center text-base-content/60 mt-6">
            {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
            <button
              onClick={() => setIsRegister(!isRegister)}
              className="text-emerald-400 hover:underline"
            >
              {isRegister ? 'Login' : 'Register'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
