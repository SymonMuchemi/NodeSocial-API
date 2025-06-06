const express = require('express');
const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user');
const advancedResults = require('../middleware/advancedResults');

// import protect middleware
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.route('/').get(advancedResults(User), getUsers).post(createUser);

router.route('/:id').get(getUser).put(updateUser).delete(deleteUser);

module.exports = router;
