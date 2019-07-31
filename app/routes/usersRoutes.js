const router = require('express').Router()
const usersController = require('../controllers/usersController');
const auth = require('../controllers/auth');

if (process.env.USER_REGISTRATION_OPEN_PUBLIC == 'true') {
    router.post('/user/register', usersController.create);
}
else {
    router.post('/user/register', auth.validateUser, usersController.create);
}
router.post('/user/authenticate', usersController.authenticate);

module.exports = router
