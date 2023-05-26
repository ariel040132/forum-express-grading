const { Restaurant, Category, Comment, User } = require('../models')
const { getOffset, getPagination } = require('../helpers/pagination-helper')
const restaurantController = {
  getRestaurants: (req, res) => {
    const DEFAULT_LIMIT = 9
    const categoryId = Number(req.query.categoryId) || ''
    const page = Number(req.query.page) || 1
    const limit = Number(req.query.limit) || DEFAULT_LIMIT
    const offset = getOffset(limit, page)
    return Promise.all([Restaurant.findAndCountAll({
      include: Category,
      where: {
        ...categoryId ? { categoryId } : {}
      },
      // const where = {}
      // if (categoryId) where.categoryId = categoryId
      // Promise.all({
      // Restaurant.findAll({
      // include: Category,
      // where: where,
      // nest: true,
      // raw: true
      // }),
      limit,
      offset,
      nest: true,
      raw: true
    }), Category.findAll({ raw: true })
    ])
      .then(([restaurants, categories]) => {
        const favoritedRestaurantsId = req.user && req.user.FavoritedRestaurants.map(fr => fr.id)
        const data = restaurants.rows.map(r => ({
          ...r,
          description: r.description.substring(0, 50),
          isFavorited: favoritedRestaurantsId.includes(r.id)
        }))
        return res.render('restaurants', {
          restaurants: data, categories, categoryId, pagination: getPagination(limit, page, restaurants.count)
        })
      })
  },
  getRestaurant: (req, res, next) => {
    return Restaurant.findByPk(req.params.id, {
      include: [
        Category,
        { model: Comment, include: User },
        { model: User, as: 'FavoritedUsers' }]
    }).then(restaurant => {
      if (!restaurant) throw new Error("Restaurant didn't exist!")
      console.log('Its: ', restaurant.Comments[0])
      return restaurant.increment('viewCounts', { by: 1 })
    }).then(restaurant => {
      const isFavorited = restaurant.FavoritedUsers.some(f => f.id === req.user.id)
      res.render('restaurant', {
        restaurant: restaurant.toJSON(),
        isFavorited
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
