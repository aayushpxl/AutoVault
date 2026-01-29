import React, { useState } from "react";
import {
  useUserProfile,
  useDeleteUserProfile,
  useUpdateUserProfile,
  useUpdateProfilePicture,
} from "../hooks/useProfilePage";
import { FaEdit, FaTrashAlt, FaSignOutAlt, FaCamera } from "react-icons/fa";
import LogoutModal from "../components/profile/LogoutModal";
import DeleteProfileModal from "../components/profile/DeleteProfileModal";
import EditProfile from "../components/profile/EditProfile";
import MFASettings from "../components/profile/MFASettings";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const { data: user, isLoading, error } = useUserProfile();
  const { mutate: deleteUser, isLoading: isDeleting } = useDeleteUserProfile();

  // Use mutations with manual control
  const { mutateAsync: updateUser } = useUpdateUserProfile({ quiet: true });
  const { mutateAsync: updateProfilePic, isPending: isUpdatingPic } = useUpdateProfilePicture({ quiet: true });

  const [isUpdating, setIsUpdating] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleSave = async (formData) => {
    setIsUpdating(true);
    const { _newFile, ...profileData } = formData;

    try {
      // 1. If a new file was selected, upload it first
      if (_newFile) {
        await updateProfilePic(_newFile);
      }

      // 2. Strip profilePic from JSON (as it's handled above)
      if (profileData.profilePic && typeof profileData.profilePic === 'string' && profileData.profilePic.startsWith('data:image')) {
        delete profileData.profilePic;
      }

      // 3. Update the rest of the profile
      await updateUser(profileData);

      // 4. Single Success notification
      import("react-toastify").then(({ toast }) => toast.success("Profile updated successfully!"));
      setIsEditing(false);
    } catch (err) {
      import("react-toastify").then(({ toast }) => toast.error(err.response?.data?.message || "Failed to update profile."));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        await updateProfilePic(file);
        import("react-toastify").then(({ toast }) => toast.success("Profile picture updated!"));
      } catch (err) {
        import("react-toastify").then(({ toast }) => toast.error(err.response?.data?.message || "Failed to update profile picture."));
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500 text-lg animate-pulse">Loading profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg text-center">
          Error loading profile: {error.message}
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-100">
        <p className="text-gray-500 text-lg">No user data found.</p>
      </div>
    );
  }

  // Build the correct URL for the profile picture
  // If user.profilePic is already a full URL, use it. Otherwise, build it from baseURL.
  const getProfilePicUrl = () => {
    if (!user.profilePic) return null;
    if (user.profilePic.startsWith('http')) return user.profilePic;

    // Get server root from VITE_API_BASE_URL (removing /api)
    const apiBase = import.meta.env.VITE_API_BASE_URL || "https://localhost:5000/api";
    const serverRoot = apiBase.replace(/\/api\/?$/, "");
    return `${serverRoot}/uploads/${user.profilePic}`;
  };

  const profilePicUrl = getProfilePicUrl();

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Top Header with Avatar and Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative group">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-3xl font-semibold shadow-inner overflow-hidden border-2 border-white relative">
                {profilePicUrl ? (
                  <img
                    src={profilePicUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails, hide it and the fallback (initials) will be visible behind
                      // Actually, let's just null out the URL locally for this render
                      e.target.style.display = 'none';
                    }}
                  />
                ) : null}
                {/* Fallback Initials (rendered behind the image) */}
                <span className="absolute inset-0 flex items-center justify-center -z-10 bg-inherit rounded-full">
                  {user.username?.[0]?.toUpperCase()}
                </span>

                {isUpdatingPic && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                  </div>
                )}
              </div>
              <label className="absolute bottom-0 right-0 p-2 bg-black text-white rounded-full cursor-pointer hover:bg-gray-800 transition shadow-lg opacity-0 group-hover:opacity-100">
                <FaCamera size={14} />
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={isUpdatingPic} />
              </label>
            </div>
            <div>
              <h1 className="text-3xl font-semibold text-gray-900">{user.username}</h1>
              <p className="text-sm text-gray-500">
                Joined on{" "}
                {new Date(user.createdAt).toLocaleDateString(undefined, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 flex-wrap sm:justify-end">
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition text-sm"
              >
                <FaEdit />
                Edit Profile
              </button>
            )}
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-black hover:bg-gray-100 rounded transition"
            >
              <FaSignOutAlt />
              Logout
            </button>

            <button
              onClick={() => setShowDeleteModal(true)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:text-white hover:bg-red-600 border border-red-500 rounded transition"
            >
              <FaTrashAlt />
              Delete Account
            </button>
          </div>
        </div>

        {/* Profile Info or Edit Form */}
        <div className="bg-white shadow-sm border rounded-xl p-6">
          {isEditing ? (
            <EditProfile
              initialData={user}
              onSave={handleSave}
              isPending={isUpdating}
              onCancel={handleCancel}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Email</h3>
                <p className="text-lg text-gray-800">{user.email}</p>
              </div>
              <div>
                <h3 className="text-sm text-gray-500 mb-1">Phone</h3>
                <p className="text-lg text-gray-800">{user.phone || "Not set"}</p>
              </div>
              <div className="sm:col-span-2">
                <h3 className="text-sm text-gray-500 mb-1">Bio</h3>
                <p className="text-base text-gray-700">{user.bio || "No bio provided."}</p>
              </div>
            </div>
          )}
        </div>

        {/* MFA Settings */}
        {!isEditing && <MFASettings />}

      </div>

      {/* Modals */}
      <LogoutModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onLogout={handleLogout}
        isLoading={false}
      />

      <DeleteProfileModal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        onDelete={() => deleteUser()}
        isLoading={isDeleting}
      />
    </div>
  );
};

export default UserProfilePage;
