import React, { useState } from "react";
import {
  useUserProfile,
  useDeleteUserProfile,
  useUpdateUserProfile,
} from "../hooks/useProfilePage";
import { FaEdit, FaTrashAlt, FaSignOutAlt } from "react-icons/fa";
import LogoutModal from "../components/profile/LogoutModal";
import DeleteProfileModal from "../components/profile/DeleteProfileModal";
import EditProfile from "../components/profile/EditProfile";
import { useNavigate } from "react-router-dom";

const UserProfilePage = () => {
  const { data: user, isLoading, error } = useUserProfile();
  const { mutate: deleteUser, isLoading: isDeleting } = useDeleteUserProfile();
  const { mutate: updateUser, isPending: isUpdating } = useUpdateUserProfile();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.clear();
    setShowLogoutModal(false);
    navigate("/login");
  };

  const handleSave = (formData) => {
    updateUser(formData, {
      onSuccess: () => {
        setIsEditing(false);
      },
    });
  };

  const handleCancel = () => {
    setIsEditing(false);
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

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-12">
      <div className="max-w-4xl mx-auto space-y-12">

        {/* Top Header with Avatar and Buttons */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gray-400 to-gray-600 flex items-center justify-center text-white text-2xl font-semibold shadow-inner">
              {user.username?.[0]?.toUpperCase()}
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
