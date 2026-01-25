// // src/utils/savedVehicles.js
// export const getSavedVehicles = () => {
//   return JSON.parse(localStorage.getItem("savedVehicles")) || [];
// };

// export const saveVehicle = (vehicleId) => {
//   const saved = getSavedVehicles();
//   if (!saved.includes(vehicleId)) {
//     saved.push(vehicleId);
//     localStorage.setItem("savedVehicles", JSON.stringify(saved));
//   }
// };

// export const unsaveVehicle = (vehicleId) => {
//   const updated = getSavedVehicles().filter((id) => id !== vehicleId);
//   localStorage.setItem("savedVehicles", JSON.stringify(updated));
// };

// export const isVehicleSaved = (vehicleId) => {
//   return getSavedVehicles().includes(vehicleId);
// };
