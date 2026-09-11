import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { updateProfile } from "../features/auth/authSlice";

export default function Profile() {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const [name, setName] = useState(user?.name || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || "");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccess(false);
    const result = await dispatch(updateProfile(name, avatarUrl));
    if (result.success) setSuccess(true);
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-2xl font-bold text-white mb-6">Profile</h1>
      <div className="bg-base-200 rounded-xl p-6 border border-base-300">
        <div className="flex items-center gap-4 mb-6">
          {user?.avatar_url ? (
            <img
              src={user.avatar_url}
              alt={user?.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 flex items-center justify-center">
              <span className="text-white text-xl font-bold">
                {user?.name?.charAt(0)?.toUpperCase() || "U"}
              </span>
            </div>
          )}
          <div>
            <p className="font-semibold text-white">{user?.name}</p>
            <p className="text-sm text-base-content/60">{user?.email}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label text-sm text-base-content/70 mb-1 block">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input input-bordered w-full bg-base-100"
              placeholder="Your name"
              required
            />
          </div>
          <div>
            <label className="label text-sm text-base-content/70 mb-1 block">
              Avatar URL
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              className="input input-bordered w-full bg-base-100"
              placeholder="https://example.com/avatar.jpg"
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}
          {success && (
            <p className="text-sm text-emerald-400">
              Profile updated successfully.
            </p>
          )}

          <button
            type="submit"
            className="btn bg-emerald-500 hover:bg-emerald-600 text-white border-none"
            disabled={loading}
          >
            {loading ? (
              <span className="loading loading-spinner loading-sm" />
            ) : (
              "Save Changes"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
