const router = require('express').Router();
const lopysController = require('../controllers/lopysController');
const auth = require('../middleware/authUserMiddleware');

router.get('/lopys', auth.validateUser, lopysController.getAll);
router.get('/lopys/:mac', auth.validateUser, lopysController.get);
router.delete('/lopys/:mac', auth.validateUser, lopysController.delete);

module.exports = router;
