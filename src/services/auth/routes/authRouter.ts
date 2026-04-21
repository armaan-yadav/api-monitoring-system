import { Router } from 'express';
import validateBody from '../../../shared/middlewares/validateRequest';
import dependencies from '../dependencies/dependencies';
import {
    loginSchema,
    onboardSuperAdminSchema,
    registerSchema,
} from '../validations/authValidation';
import authenticate from '../../../shared/middlewares/authenticate';
import authorize from '../../../shared/middlewares/authorize';
import { json } from 'zod';

const authRouter = Router();
const { authController } = dependencies;

authRouter.post('/onboard-super-admin', validateBody(onboardSuperAdminSchema), (req, res, next) => {
    authController.onboardSuperAdmin(req, res, next);
});
authRouter.post(
    '/register',
    authenticate,
    authorize(['super_admin']),
    validateBody(registerSchema),
    (req, res, next) => {
        authController.register(req, res, next);
    }
);
authRouter.post('/login', validateBody(loginSchema), (req, res, next) => {
    authController.login(req, res, next);
});
authRouter.get('/logout', authenticate, (req, res, next) => {
    authController.logout(req, res, next);
});
authRouter.get('/profile', authenticate, (req, res, next) => {
    authController.getProfile(req, res, next);
});

export default authRouter;
