const express = require('express')
const router = express.Router()
const restaurantController = require('../../controllers/apis/restaurant-controller')
const adminController = require('../../controllers/apis/admin-controller')

router.get('/admin/restaurants', adminController.getRestaurants)
router.get('/restaurants', restaurantController.getRestaurants)

module.exports = router
