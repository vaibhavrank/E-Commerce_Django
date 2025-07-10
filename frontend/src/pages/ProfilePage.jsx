import React, { useState, useEffect } from 'react';
import { User, Mail, MapPin, Calendar, Edit2, Save, X, Camera, Upload } from 'lucide-react';
import { useSelector } from 'react-redux';

const ProfilePage = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState({});
  const [editValues, setEditValues] = useState({});
  const [updateLoading, setUpdateLoading] = useState({});
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Mock access token - in real app, get from Redux store
  const {accessToken} = useSelector((state)=>state.auth);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:8000/api/auth/profile/', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          // 'Content-Type': 'application/json',
        },
      });
      console.log("DATA..............",response)
      if (response.ok) {
        const data = await response.json();
        setProfile(data);
        setEditValues({
          first_name: data.first_name,
          last_name: data.last_name,
          email: data.email,
          address: data.address || '',
        });
      } else {
        setError('Failed to fetch profile data');
      }
    } catch (error) {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (field) => {
    setEditMode({ ...editMode, [field]: true });
    setError('');
    setSuccess('');
  };

  const handleCancel = (field) => {
    setEditMode({ ...editMode, [field]: false });
    setEditValues({
      ...editValues,
      [field]: profile[field] || '',
    });
  };

  const handleSave = async (field) => {
    try {
      setUpdateLoading({ ...updateLoading, [field]: true });
      
      const updateData = {
        [field]: editValues[field]
      };

      const response = await fetch('http://localhost:8000/api/auth/profile/update/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setProfile({ ...profile, [field]: editValues[field] });
        setEditMode({ ...editMode, [field]: false });
        setSuccess(`${field.replace('_', ' ')} updated successfully!`);
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to update profile');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUpdateLoading({ ...updateLoading, [field]: false });
    }
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setUpdateLoading({ ...updateLoading, profile_image: true });
      
      const formData1 = new FormData();
      formData1.append('profile_image', file);
      const response = await fetch('http://localhost:8000/api/auth/profile/update/', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
        body: formData1,
      });
      // console.log(response)
      if (response.ok) {
        const updatedData = await response.json();
        console.log("RESPONSE.................",updatedData);
        console.log(profile,updatedData.user.profile_image_url)
        setProfile({ ...profile, profile_image_url: updatedData.user.profile_image_url });
        setSuccess('Profile image updated successfully!');
        setTimeout(() => setSuccess(''), 3000);
      } else {
        setError('Failed to update profile image');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setUpdateLoading({ ...updateLoading, profile_image: false });
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Failed to load profile</p>
          <button 
            onClick={fetchProfile}
            className="mt-4 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 mt-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
          <p className="text-gray-600">Manage your account information</p>
        </div>

        {/* Messages */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg">
            {success}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Image Card */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 text-center">
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-200 mx-auto">
                  {profile.profile_image_url ? (
                    <img
                      src={profile.profile_image_url}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-16 h-16 text-gray-400" />
                    </div>
                  )}
                </div>
                <label className="absolute bottom-0 right-0 bg-gray-900 text-white p-2 rounded-full cursor-pointer hover:bg-gray-800 transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  {updateLoading.profile_image ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Camera className="w-4 h-4" />
                  )}
                </label>
              </div>
              <h2 className="text-xl font-semibold text-gray-900 mb-1">
                {profile.first_name} {profile.last_name}
              </h2>
              <p className="text-gray-600 mb-4">{profile.email}</p>
              <div className="flex items-center justify-center text-sm text-gray-500">
                <Calendar className="w-4 h-4 mr-2" />
                Member since {formatDate(profile.created_at)}
              </div>
            </div>
          </div>

          {/* Profile Details Card */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6">Personal Information</h3>
              
              <div className="space-y-6">
                {/* First Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    First Name
                  </label>
                  <div className="flex items-center space-x-3">
                    {editMode.first_name ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editValues.first_name}
                          onChange={(e) => setEditValues({...editValues, first_name: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => handleSave('first_name')}
                          disabled={updateLoading.first_name}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {updateLoading.first_name ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCancel('first_name')}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-gray-900">{profile.first_name}</span>
                        <button
                          onClick={() => handleEdit('first_name')}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Last Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Last Name
                  </label>
                  <div className="flex items-center space-x-3">
                    {editMode.last_name ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editValues.last_name}
                          onChange={(e) => setEditValues({...editValues, last_name: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => handleSave('last_name')}
                          disabled={updateLoading.last_name}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {updateLoading.last_name ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCancel('last_name')}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-gray-900">{profile.last_name}</span>
                        <button
                          onClick={() => handleEdit('last_name')}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <div className="flex items-center space-x-3">
                    {editMode.email ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="email"
                          value={editValues.email}
                          onChange={(e) => setEditValues({...editValues, email: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                        />
                        <button
                          onClick={() => handleSave('email')}
                          disabled={updateLoading.email}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {updateLoading.email ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCancel('email')}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-gray-900">{profile.email}</span>
                        <button
                          onClick={() => handleEdit('email')}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Address
                  </label>
                  <div className="flex items-center space-x-3">
                    {editMode.address ? (
                      <div className="flex-1 flex items-center space-x-2">
                        <input
                          type="text"
                          value={editValues.address}
                          onChange={(e) => setEditValues({...editValues, address: e.target.value})}
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent outline-none"
                          placeholder="Enter your address"
                        />
                        <button
                          onClick={() => handleSave('address')}
                          disabled={updateLoading.address}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                        >
                          {updateLoading.address ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => handleCancel('address')}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex-1 flex items-center justify-between">
                        <span className="text-gray-900">{profile.address || 'No address provided'}</span>
                        <button
                          onClick={() => handleEdit('address')}
                          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;