const express = require('express');
const {
  getAllReviews,
  createReview,
  deleteReview,
  updateReview,
  setTourUserIds,
  getReview,
} = require('../controllers/reviewController');
const { protect, restrictTo } = require('../controllers/authController');

// Merge params option
const router = express.Router({ mergeParams: true });

// Since midleware runs in sequence, this protect middleware handles for all the routes below
router.use(protect);

router
  .route('/')
  //GET /tours/:tourId/reviews
  //GET /reviews
  .get(getAllReviews)
  //POST /tours/:tourId/reviews
  .post(restrictTo('user'), setTourUserIds, createReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('admin', 'user'), updateReview)
  .delete(restrictTo('admin', 'user'), deleteReview);

module.exports = router;
