const router = require('express').Router();
const lopysController = require('../controllers/lopysController');
const auth = require('../middleware/authUserMiddleware');

router.get('/lopys', auth.validateUser, lopysController.getAll);
router.delete('/lopys/:id', auth.validateUser, lopysController.delete);

module.exports = router;