import { Router } from 'express';
import validateBody from '../../../shared/middlewares/validateRequest';
import dependencies from '../dependencies/dependencies';
import { onboardSuperAdminSchema } from '../validations/authValidation';

const authRouter = Router();
const { authController } = dependencies.controllers;

authRouter.post('/onboard-super-admin', validateBody(onboardSuperAdminSchema), (req, res, next) => {
    authController.onboardSuperAdmin(req, res, next);
});

export default authRouter;
 