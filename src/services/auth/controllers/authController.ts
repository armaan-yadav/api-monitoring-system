import type { NextFunction, Request, Response } from 'express';
import config from '../../../shared/config';
import ResponseFormatter from '../../../shared/utils/responseFormatter';
import { type IAuthService } from '../services/authService';
import type {
    LoginInput,
    OnboardSuperAdminInput,
    RegisterInput,
} from '../validations/authValidation';
import AppError from '../../../shared/utils/appError';

class AuthController {
    private authService: IAuthService;
    constructor(authService: IAuthService) {
        if (!authService) {
            throw new Error('AuthService is required');
        }
        this.authService = authService;
    }

    async onboardSuperAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password } = req.body as OnboardSuperAdminInput;
            const { token, user } = await this.authService.onboardSuperAdmin({
                email,
                password,
                username,
            });

            res.cookie('authToken', token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.maxAge,
            });

            res.status(201).json(
                ResponseFormatter.success(201, 'Super admin onboarded successfully', {
                    user,
                })
            );
        } catch (error) {
            next(error);
        }
    }

    async register(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, email, password, role } = req.body as RegisterInput;

            const { token, user } = await this.authService.register({
                email,
                password,
                username,
                role,
            });

            res.cookie('authToken', token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.maxAge,
            });

            res.status(201).json(
                ResponseFormatter.success(201, 'User registered successfully', {
                    user,
                })
            );
        } catch (error) {
            next(error);
        }
    }
    async login(req: Request, res: Response, next: NextFunction) {
        try {
            const { username, password } = req.body as LoginInput;

            const { token, user } = await this.authService.login({
                username,
                password,
            });

            res.cookie('authToken', token, {
                httpOnly: config.cookie.httpOnly,
                secure: config.cookie.secure,
                maxAge: config.cookie.maxAge,
            });

            res.status(200).json(
                ResponseFormatter.success(200, 'Login successful', {
                    user,
                })
            );
        } catch (error) {
            next(error);
        }
    }
    async logout(req: Request, res: Response, next: NextFunction) {
        try {
            res.clearCookie('authToken');
            res.status(200).json(ResponseFormatter.success(200, 'Logout successful'));
        } catch (error) {
            next(error);
        }
    }
    async getProfile(req: Request, res: Response, next: NextFunction) {
        try {
            const userId = req.user?.userId;
            const { user } = await this.authService.getProfile(userId as string);
            res.status(200).json(
                ResponseFormatter.success(200, 'Profile fetched successfully', { user })
            );
        } catch (error) {
            next(error);
        }
    }
}

export default AuthController;
