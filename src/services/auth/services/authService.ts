import jwt from 'jsonwebtoken';
import config from '../../../shared/config';
import logger from '../../../shared/config/logger';
import { ROLES } from '../../../shared/constants/roles';
import type { IUser } from '../../../shared/models/User';
import AppError from '../../../shared/utils/appError';
import type { BaseRepository } from '../repositories';
import type { OnboardSuperAdminInput } from '../validations/authValidation';

export interface IAuthService {
    generateToken(user: IUser): Promise<string>;
    onboardSuperAdmin(
        data: OnboardSuperAdminInput
    ): Promise<{ user: Partial<IUser>; token: string }>;
}

export interface IToken {
    userId: string;
    email: string;
    username: string;
    clientId: string;
    role: string;
}

class AuthService implements IAuthService {
    private repository: BaseRepository<IUser>;
    constructor(repository: BaseRepository<IUser>) {
        if (!repository) {
            throw new Error('UserRepository is required');
        }
        this.repository = repository;
    }

    async generateToken(user: IUser): Promise<string> {
        const { _id, email, username, clientId, role } = user;

        const payload = {
            userId: _id,
            email,
            username,
            clientId,
            role,
        };

        return jwt.sign(payload, config.jwt.secret, {
            expiresIn: parseInt(config.jwt.expiresIn, 10),
        });
    }

    async onboardSuperAdmin(
        data: OnboardSuperAdminInput
    ): Promise<{ user: Partial<IUser>; token: string }> {
        try {
            const existingUser = await this.repository.findAll();

            if (existingUser && existingUser.length > 0) {
                throw new AppError('Super admin already exists', 403);
            }

            const user = await this.repository.create({
                ...data,
                role: ROLES.SUPER_ADMIN,
            });
            const token = await this.generateToken(user);

            logger.info(`Super admin onboarded with email: ${user.email}`);
            return {
                user: {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    clientId: user.clientId,
                    role: user.role,
                },
                token,
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }

            logger.error('Error onboarding super admin', { error });
            throw new AppError('Error onboarding super admin', 500);
        }
    }
}
export default AuthService;
