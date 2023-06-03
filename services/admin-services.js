const { Restaurant, Category } = require('../models')
const { imgurFileHandler } = require('../helpers/file-helpers') // 引入處理檔案上傳的 helper

const adminServices = {
  getRestaurants: (req, callback) => {
    Restaurant.findAll({
      raw: true,
      nest: true,
      include: [Category]
    })
      .then(restaurants => callback(null, { restaurants })
      )
      .catch(err => callback(err))
  },
  deleteRestaurant: (req, cb) => {
    return Restaurant.findByPk(req.params.id)
      .then(restaurant => {
        if (!restaurant) {
          const err = new Error("Restaurant didn't exist!")
          err.status = 404
          throw err
        }
        return restaurant.destroy()
      })
      .then(deletedRestaurant => cb(null, { restaurant: deletedRestaurant }))
      .catch(err => cb(err))
  },
  postRestaurant: (req, cb) => {
    const { name, tel, address, openingHours, description, categoryId } = req.body
    if (!name) throw new Error('Restaurant name is required!')
    const { file } = req
    imgurFileHandler(file)
      .then(filePath => Restaurant.create({
        name,
        tel,
        address,
        openingHours,
        description,
        image: filePath || null,
        categoryId
      }))
      .then(newRestaurant => cb(null, { restaurant: newRestaurant })) // 在 callback 函式裡，我們把新增的這筆餐廳資料回傳出來 { restaurant: newRestaurant }。在前後分離的情況下，前端需要知道對後端請求後的結果，才知道要如何修改畫面，因此需要把新增的餐廳特別回傳出來。
      .catch(err => cb(err))
  }
}

module.exports = adminServices
