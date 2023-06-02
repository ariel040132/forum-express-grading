const { Restaurant, Category } = require('../models')

const adminServices = {
  getRestaurants: (req, res, callback) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => callback(null, { restaurants })
      )
      .catch(err => callback(err))
  }
}

module.exports = adminServices
