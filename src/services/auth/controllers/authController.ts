import type { NextFunction, Request, Response } from 'express';
import config from '../../../shared/config';
import ResponseFormatter from '../../../shared/utils/responseFormatter';
import { type IAuthService } from '../services/authService';

export class AuthController {
    private authService: IAuthService;
    constructor(authService: IAuthService) {
        if (!authService) {
            throw new Error('AuthService is required');
        }
        this.authService = authService;
    }

    async onboardSuperAdmin(req: Request, res: Response, next: NextFunction) {
        try {
            const { token, user } = await this.authService.onboardSuperAdmin(req.body);

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
}
