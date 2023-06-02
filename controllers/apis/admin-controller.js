const adminServices = require('../../services/admin-services')
const adminController = {
  getRestaurants: (req, res, next) => {
    adminServices.getRestaurants(res, (err, data) => err ? next(err) : res.json(data))
  }
}
module.exports = adminController
