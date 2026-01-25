import React, { useState } from "react";
import { FaPlus, FaTrash, FaEdit } from "react-icons/fa";
import { useAdminUser, useDeleteOneUser } from "../../hooks/admin/useAdminUser";
import CreateUserModal from "../../components/auth/CreateUserModal";
import UpdateUserModal from "../auth/UpdateUserModal";
import DeleteModal from "../../components/auth/DeleteModal";

export default function UserTable() {
  const [page, setPage] = useState(1);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  const limit = 5;
  const { data, isPending, error, refetch } = useAdminUser(page, limit);
  const deleteMutation = useDeleteOneUser();

  const handleDelete = () => {
    deleteMutation.mutate(deleteId, {
      onSuccess: () => {
        alert("User deleted successfully");
        refetch();
        setDeleteId(null);
      },
      onError: (err) =>
        alert("Failed to delete user: " + (err.message || "Unknown error")),
    });
  };

  const openUpdateModal = (id) => {
    setSelectedUserId(id);
    setShowUpdateModal(true);
  };

  if (isPending)
    return (
      <div className="flex justify-center items-center py-10">
        <p className="text-gray-500 animate-pulse">Loading users...</p>
      </div>
    );
  if (error)
    return (
      <p className="text-red-500 text-center py-5">
        Error loading users: {error.message}
      </p>
    );
  if (!data?.data?.length)
    return (
      <p className="text-gray-500 text-center py-5">No users found.</p>
    );

  return (
    <div className="w-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
        <h2 className="text-2xl font-bold text-gray-800">User Management</h2>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <FaPlus className="text-sm" /> Add User
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gradient-to-r from-indigo-50 to-indigo-100 text-indigo-700 uppercase text-xs tracking-wider">
              <th className="px-6 py-4">Username</th>
              <th className="px-6 py-4">Email</th>
              <th className="px-6 py-4">Role</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {data.data.map((user, index) => (
              <tr
                key={user._id}
                className={`transition-all duration-200 ease-in-out ${
                  index % 2 === 0 ? "bg-white" : "bg-gray-50"
                } hover:bg-indigo-50 hover:shadow-sm`}
              >
                <td className="px-6 py-4 font-medium text-gray-800">
                  {user.username}
                </td>
                <td className="px-6 py-4 text-gray-600">{user.email}</td>
                <td className="px-6 py-4 capitalize">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      user.role === "admin"
                        ? "bg-red-100 text-red-600"
                        : "bg-green-100 text-green-600"
                    }`}
                  >
                    {user.role}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => openUpdateModal(user._id)}
                      className="flex items-center gap-1 bg-yellow-400 hover:bg-yellow-500 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 text-xs"
                    >
                      <FaEdit /> Edit
                    </button>
                    <button
                      onClick={() => setDeleteId(user._id)}
                      disabled={
                        deleteMutation.isLoading && deleteId === user._id
                      }
                      className="flex items-center gap-1 bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 rounded-lg shadow-sm hover:shadow transition-all duration-200 text-xs disabled:opacity-50"
                    >
                      <FaTrash />
                      {deleteMutation.isLoading && deleteId === user._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
          disabled={page === 1}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50 transition"
        >
          Previous
        </button>
        <span className="text-sm text-gray-600">
          Page {page} of {Math.ceil((data?.total || 0) / limit)}
        </span>
        <button
          onClick={() =>
            setPage((prev) =>
              Math.min(prev + 1, Math.ceil((data?.total || 0) / limit))
            )
          }
          disabled={page === Math.ceil((data?.total || 0) / limit)}
          className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg disabled:opacity-50 transition"
        >
          Next
        </button>
      </div>

      {/* Create User Modal */}
      <CreateUserModal
        showModal={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          refetch();
        }}
      />

      {/* Update User Modal */}
      <UpdateUserModal
        showModal={showUpdateModal}
        userId={selectedUserId}
        onClose={() => {
          setShowUpdateModal(false);
          setSelectedUserId(null);
        }}
        onSuccess={refetch}
      />

      {/* Delete Modal */}
      <DeleteModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={handleDelete}
        title="Delete User"
        description="Are you sure you want to delete this user? This action cannot be undone."
      />
    </div>
  );
}
