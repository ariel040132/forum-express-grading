const { Restaurant, Category, Comment, User } = require('../../models')
const restaurantServices = require('../../services/restaurant-services')
const restaurantController = {
  getRestaurants: (req, res, next) => {
    restaurantServices.getRestaurants(req, (err, data) => err ? next(err) : res.render('restaurants', data))
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' },
        { model: User, as: 'LikedUsers' }]
    }).then(restaurant => {
      if (!restaurant) throw new Error("Restaurant didn't exist!")
      console.log('Its: ', restaurant.Comments[0])
      return restaurant.increment('viewCounts', { by: 1 })
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
      const isLiked = restaurant.LikedUsers.some(l => l.id === req.user.id)

      res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited,
        isLiked
      })
    }).catch(err => next(err))
  },
  getDashboard: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: Category,
      nest: true,
      raw: true
    })
      .then(restaurant => {
        if (!restaurant) throw new Error("Restaurant didn't exist!")

        res.render('dashboard', { restaurant })
      })
      .catch(err => next(err))
  },
  getFeeds: (req, res, next) => {
    Promise.all([Restaurant.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [Category],
      raw: true,
      nest: true
    }), Comment.findAll({
      limit: 10,
      order: [['created_at', 'DESC']],
      include: [User, Restaurant],
      raw: true,
      nest: true
    })
    ]).then(([restaurants, comments]) => {
      res.render('feeds', { restaurants, comments })
    }).catch(err => next(err))
  }

}
module.exports = restaurantController
