const router = require('express').Router();
const { authenticate } = require('../../middleware/auth');
const { get, update, changePassword, listSaved, addSaved, removeSaved } = require('./controller');

router.use(authenticate);
router.get('/',                  get);
router.put('/',                  update);
router.put('/change-password',   changePassword);
router.get('/saved',             listSaved);
router.post('/saved/:hotelId',   addSaved);
router.delete('/saved/:hotelId', removeSaved);

module.exports = router;
