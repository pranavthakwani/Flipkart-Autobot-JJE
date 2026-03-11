import express from 'express';
import { accountController } from '../controllers/accountController.js';

const router = express.Router();

router.get('/', accountController.getAllAccounts);
router.post('/', accountController.createAccount);
router.post('/upload-cookies', accountController.uploadCookies);
router.delete('/:id', accountController.deleteAccount);

export default router;
