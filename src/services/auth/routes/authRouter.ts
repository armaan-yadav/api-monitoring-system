import { Router } from 'express';
import validateBody from '../../../shared/middlewares/validateRequest';
import dependencies from '../dependencies/dependencies';
import { onboardSuperAdminSchema } from '../validations/authValidation';
import authenticate from '../../../shared/middlewares/authenticate';

const authRouter = Router();
const { authController } = dependencies;

authRouter.post('/onboard-super-admin', validateBody(onboardSuperAdminSchema), (req, res, next) => {
    authController.onboardSuperAdmin(req, res, next);
});
authRouter.get("/test",authenticate,(req,res)=>{
    
    res.json({"hello":"world",user : req.user})

})

export default authRouter;
