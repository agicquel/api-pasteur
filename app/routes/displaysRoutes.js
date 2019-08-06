const router = require('express').Router();
const displaysController = require('../controllers/displaysController');
const auth = require('../controllers/auth');

router.get('/displays', auth.validateUser, displaysController.getAll);
router.post('/displays', auth.validateUser, displaysController.add);

router.get('/displays/:id', auth.validateUser, displaysController.get);
router.put('/displays/:id', auth.validateUser, displaysController.update);
router.delete('/displays/:id', auth.validateUser, displaysController.delete);

router.post('/displays/addOwner/:id', auth.validateUser, displaysController.addOwner);
router.post('/displays/deleteOwner/:id', auth.validateUser, displaysController.deleteOwner);

module.exports = router;