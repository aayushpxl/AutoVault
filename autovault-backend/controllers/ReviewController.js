const Review = require("../models/Review");

exports.addReview = async (req, res) => {
  try {
    const { vehicleId, rating, comment } = req.body;
    const userId = req.user._id;

    const review = await Review.create({ vehicleId, userId, rating, comment });
    res.status(201).json({ message: "Review added", review });
  } catch (error) {
    res.status(500).json({ message: "Failed to add review", error: error.message });
  }
};

exports.getVehicleReviews = async (req, res) => {
  try {
    const { vehicleId } = req.params;

    const reviews = await Review.find({ vehicleId })
      .populate("userId", "username email")
      .sort({ createdAt: -1 });

    res.status(200).json(reviews);
  } catch (error) {
    res.status(500).json({ message: "Failed to get reviews", error: error.message });
  }
};
