import React, { useState, useEffect } from 'react';

export function ProfileView() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [profile, setProfile] = useState({
    username: '',
    email: '',
    avatar_url: '',
    bio: '',
    website: '',
    twitter: '',
    github: '',
    member_since: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const apiKey = localStorage.getItem('xr_publisher_api_key');
      if (!apiKey) {
        setError('API key not found. Please log in.');
        setLoading(false);
        return;
      }

      const [username] = apiKey.split('.');
      const response = await fetch(`https://xr-publisher.sxpdigital.workers.dev/author-data?author=${username}`);
      
      if (!response.ok) throw new Error('Failed to fetch profile data');
      
      const data = await response.json();
      setProfile({
        username: username,
        email: data.email || '',
        avatar_url: data.avatar_url || 'https://assets.pluginpublisher.com/default_pfp.jpg',
        bio: data.bio || '',
        website: data.website || '',
        twitter: data.twitter || '',
        github: data.github || '',
        member_since: data.member_since || new Date().toISOString()
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      const apiKey = localStorage.getItem('xr_publisher_api_key');
      if (!apiKey) throw new Error('API key not found');

      const [username] = apiKey.split('.');
      
      const response = await fetch('https://xr-publisher.sxpdigital.workers.dev/update-author-info', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: username,
          worldName: 'profile',
          authorData: {
            ...profile,
            username: username
          }
        })
      });

      if (!response.ok) throw new Error('Failed to update profile');
      
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <div className="bg-[#1b1b1b] border border-[#333] rounded-lg p-6">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-white mb-2">Profile Settings</h2>
          <p className="text-gray-400">Manage your XR Publisher profile information</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="flex items-center space-x-4 mb-6">
            <img
              src={profile.avatar_url}
              alt="Profile"
              className="w-20 h-20 rounded-full"
            />
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Avatar URL
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#333] text-white border border-[#444] rounded-md focus:outline-none focus:border-[#84cc16]"
                value={profile.avatar_url}
                onChange={(e) => setProfile({ ...profile, avatar_url: e.target.value })}
                placeholder="URL to your avatar image"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Username
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 bg-[#444] text-gray-400 border border-[#444] rounded-md cursor-not-allowed"
                value={profile.username}
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                className="w-full px-3 py-2 bg-[#333] text-white border border-[#444] rounded-md focus:outline-none focus:border-[#84cc16]"
                value={profile.email}
                onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                placeholder="Your email address"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Bio
              </label>
              <textarea
                className="w-full px-3 py-2 bg-[#333] text-white border border-[#444] rounded-md focus:outline-none focus:border-[#84cc16] h-24"
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                placeholder="Tell us about yourself"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Website
              </label>
              <input
                type="url"
                className="w-full px-3 py-2 bg-[#333] text-white border border-[#444] rounded-md focus:outline-none focus:border-[#84cc16]"
                value={profile.website}
                onChange={(e) => setProfile({ ...profile, website: e.target.value })}
                placeholder="Your website URL"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Twitter Username
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-[#333] text-white border border-[#444] rounded-md focus:outline-none focus:border-[#84cc16]"
                  value={profile.twitter}
                  onChange={(e) => setProfile({ ...profile, twitter: e.target.value })}
                  placeholder="Twitter username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  GitHub Username
                </label>
                <input
                  type="text"
                  className="w-full px-3 py-2 bg-[#333] text-white border border-[#444] rounded-md focus:outline-none focus:border-[#84cc16]"
                  value={profile.github}
                  onChange={(e) => setProfile({ ...profile, github: e.target.value })}
                  placeholder="GitHub username"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 text-red-200 px-4 py-3 rounded relative">
              <strong className="font-bold">Error!</strong>
              <span className="block sm:inline"> {error}</span>
            </div>
          )}

          {success && (
            <div className="bg-green-900/50 border border-green-500 text-green-200 px-4 py-3 rounded relative">
              <strong className="font-bold">Success!</strong>
              <span className="block sm:inline"> Your profile has been updated successfully.</span>
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={`w-full bg-[#84cc16] text-black py-2 px-4 rounded-md font-medium 
              ${saving ? 'opacity-50 cursor-not-allowed' : 'hover:bg-[#84cc16]/90'}`}
          >
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};
