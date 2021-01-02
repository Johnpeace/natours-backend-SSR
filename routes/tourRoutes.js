const express = require('express');
const {
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
  getAllTours,
  createTour,
  updateTour,
  deleteTour,
  getTour,
  getToursWithin,
  getDistances,
} = require('../controllers/toursController');
const { protect, restrictTo } = require('../controllers/authController');
// const {
//   getAllReviews,
//   createReview,
// } = require('../controllers/reviewController');
const reviewRouter = require('./reviewRoutes');

const router = express.Router();
/**
  .route('/:tourId/reviews')
  .post(protect, restrictTo('user'), createReview);
 */

// Merge params implementation mount
router.use('/:tourId/reviews', reviewRouter);

/**
Param Middleware
router.param('id', checkID);
 */
router.route('/top-5-cheap').get(aliasTopTours, getAllTours);

router.route('/tour-stats').get(getTourStats);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide', 'guide'), getMonthlyPlan);

router
  .route('/tours-within/:distance/center/:latlng/unit/:unit')
  .get(getToursWithin);

router.route('/distances/:latlng/unit/:unit').get(getDistances);

router
  .route('/')
  .get(getAllTours)
  .post(protect, restrictTo('admin', 'lead-guide'), createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(protect, restrictTo('admin', 'lead-guide'), updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide', 'user'), deleteTour);

module.exports = router;
