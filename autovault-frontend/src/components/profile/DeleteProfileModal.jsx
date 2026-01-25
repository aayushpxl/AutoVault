import React from "react";

export default function DeleteProfileModal({ isOpen, onClose, onDelete, isLoading }) {
  if (!isOpen) return null;

  return (
    <div style={{
      position: "fixed",
      inset: 0,
      backgroundColor: "rgba(0, 0, 0, 0.4)",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      zIndex: 1000,
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    }}>
      <div style={{
        backgroundColor: "#fff",
        padding: "30px 40px",
        borderRadius: 12,
        boxShadow: "0 8px 20px rgba(0,0,0,0.15)",
        maxWidth: 420,
        width: "90%",
        textAlign: "center",
        color: "#333",
      }}>
        <h2 style={{ marginBottom: 10, fontWeight: "700", fontSize: "1.6rem" }}>
          Confirm Delete Profile
        </h2>
        <p style={{ marginBottom: 30, fontSize: "1rem", color: "#555" }}>
          Are you sure you want to delete your account? This action cannot be undone.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 15 }}>
          <button
            onClick={onDelete}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 0",
              backgroundColor: isLoading ? "#b33939" : "#d93025",
              border: "none",
              borderRadius: 6,
              color: "#fff",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease",
            }}
          >
            {isLoading ? "Deleting..." : "Yes, Delete"}
          </button>

          <button
            onClick={onClose}
            disabled={isLoading}
            style={{
              flex: 1,
              padding: "12px 0",
              backgroundColor: "#f0f0f0",
              border: "1px solid #ccc",
              borderRadius: 6,
              color: "#333",
              fontWeight: "600",
              fontSize: "1rem",
              cursor: isLoading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease",
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = "#e6e6e6"}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = "#f0f0f0"}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
