'use strict';

const bcrypt = require('bcrypt')
const moment = require('moment')

module.exports = {
  up: async (queryInterface, Sequelize) => {

    await queryInterface.bulkInsert('Users', [{
      name: 'user1',
      email: 'user1@gmail.com',
      password: bcrypt.hashSync('123', 10),
      createdAt: new Date(), updatedAt: new Date()
    }, {
      name: 'user2',
      email: 'user2@gmail.com',
      password: bcrypt.hashSync('1234', 10),
      createdAt: new Date(), updatedAt: new Date()
    }, {
      name: 'user3',
      email: 'user3@gmail.com',
      password: bcrypt.hashSync('12345', 10),
      createdAt: new Date(), updatedAt: new Date()
    }
    ], {});

    await queryInterface.bulkInsert('Categories', [{
      name: '早餐', createdAt: new Date(), updatedAt: new Date()
    }, {
      name: '中餐', createdAt: new Date(), updatedAt: new Date()
    }, {
      name: '晚餐', createdAt: new Date(), updatedAt: new Date()
    }, {
      name: '消夜', createdAt: new Date(), updatedAt: new Date()
    }, {
      name: '下午茶', createdAt: new Date(), updatedAt: new Date()
    }], {});

    await queryInterface.bulkInsert('ShareUsers', [{
      userId: '1', shareUserId: '2',
      createdAt: new Date(), updatedAt: new Date()
    }, {
      userId: '2', shareUserId: '3',
      createdAt: new Date(), updatedAt: new Date()
    }], {});

    const userIds = Array.from({ length: 3 }).map((_, i) => i + 1)
    const categoryIds = Array.from({ length: 5 }).map((_, i) => i + 1)
    const OwnCategoryArray = []
    const buildCategoryArray = userIds.map((userId) => {
      return categoryIds.map((categoryId) => {
        return {
          userId: userId,
          categoryId: categoryId,
          createdAt: new Date(), updatedAt: new Date()
        }
      })
    })
    buildCategoryArray.map(d => OwnCategoryArray.push(...d))
    await queryInterface.bulkInsert('OwnCategories', OwnCategoryArray, {});

    const paymentData = []
    const getPaymentArray = userIds.map(user => {
      return Array.from({ length: 250 }).map((_, i) => i + 1).map(i => {
        return {
          userId: user,
          price: Math.floor(Math.random() * 1000 + 1),
          categoryId: Math.floor(Math.random() * 5 + 1),
          shareUserId: Math.floor(Math.random() * 3),
          isShare: Math.floor(Math.random() + Math.random()) ? true : false,
          isShareCheck: Math.floor(Math.random() + Math.random()) ? true : false,
          isSendBack: Math.floor(Math.random() + Math.random()) ? true : false,
          createdAt: moment(Math.floor(moment(new Date()).valueOf() * ((Math.random() * 0.03) + 0.97))).format('YYYY-MM-DD'),
          updatedAt: new Date()
        }
      })
    })
    getPaymentArray.map(d => paymentData.push(...d))
    await queryInterface.bulkInsert('Payments', paymentData, {});
  },


  down: async (queryInterface, Sequelize) => {

    await queryInterface.bulkDelete('Users', null, {});
    await queryInterface.bulkDelete('Categories', null, {});
    await queryInterface.bulkDelete('ShareUsers', null, {});
    await queryInterface.bulkDelete('OwnCategories', null, {});
    await queryInterface.bulkDelete('Payments', null, {});

  }
};
