const router = require('express').Router();
const { authenticate, requireAdmin } = require('../../middleware/auth');
const {
  dashboard, listHotels, listRooms, listBookings,
  listReviews, listUsers, getSettings, updateSettings,
} = require('./controller');

router.use(authenticate);
router.use(requireAdmin);

router.get('/dashboard', dashboard);
router.get('/hotels',    listHotels);
router.get('/rooms',     listRooms);
router.get('/bookings',  listBookings);
router.get('/reviews',   listReviews);
router.get('/users',     listUsers);
router.get('/settings',  getSettings);
router.put('/settings',  updateSettings);

module.exports = router;
