const express = require('express');
const router = express.Router();
const {
  getVehicleById,
  getRelatedVehicles,
  searchVehicles,
  getVehicleTypes
} = require('../controllers/vehicleController');

router.get('/search', searchVehicles); 
router.get('/related/:id', getRelatedVehicles);
router.get('/:id', getVehicleById);
router.get("/types", getVehicleTypes);


module.exports = router;
