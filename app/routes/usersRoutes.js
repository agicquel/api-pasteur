const router = require('express').Router();
const usersController = require('../controllers/usersController');
const auth = require('../middleware/authUserMiddleware');

if (process.env.USER_REGISTRATION_OPEN_PUBLIC === 'true') {
    router.post('/users/register', auth.validateUserNotBlocking, usersController.create);
}
else {
    router.post('/users/register', auth.validateUser, usersController.create);
}
router.post('/users/authenticate', usersController.authenticate);
router.get('/users', auth.validateUser, usersController.getAll);
router.get('/users/:id', auth.validateUser, usersController.get);
router.put('/users/:id', auth.validateUser, usersController.update);
router.delete('/users/:id', auth.validateUser, usersController.delete);

module.exports = router;
