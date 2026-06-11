const router = require('express').Router();
const { authenticate, requireHost, requireAdmin } = require('../../middleware/auth');
const { create, list, detail, updateStatus, remove } = require('./controller');

// Public — submit a viewing request
router.post('/', create);

// Admin/host — list, detail, manage
router.get('/',        authenticate, list);
router.get('/:id',     authenticate, detail);
router.put('/:id/status', authenticate, updateStatus);
router.delete('/:id',  authenticate, requireAdmin, remove);

module.exports = router;
