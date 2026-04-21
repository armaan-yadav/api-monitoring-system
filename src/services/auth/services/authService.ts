import jwt, { type SignOptions } from 'jsonwebtoken';
import config from '../../../shared/config';
import logger from '../../../shared/config/logger';
import { ROLES } from '../../../shared/constants/roles';
import AppError from '../../../shared/utils/appError';
import type { IUser } from '../../../shared/models/User';
import type { BaseRepository } from '../repositories';
import type {
    LoginInput,
    OnboardSuperAdminInput,
    RegisterInput,
} from '../validations/authValidation';
import bcrypt from 'bcryptjs';

export interface IAuthService {
    generateToken(user: IUser): Promise<string>;
    onboardSuperAdmin(
        data: OnboardSuperAdminInput
    ): Promise<{ user: Partial<IUser>; token: string }>;
    register(data: RegisterInput): Promise<{ user: Partial<IUser>; token: string }>;
    login(data: LoginInput): Promise<{ user: Partial<IUser>; token: string }>;
    getProfile(userId: string): Promise<{ user: Partial<IUser> }>;
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
            expiresIn: config.jwt.expiresIn as SignOptions['expiresIn'],
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

    async register(data: RegisterInput): Promise<{ user: Partial<IUser>; token: string }> {
        try {
            // check for already existing credential
            const existingUsername = await this.repository.findByUsername(data.username);
            if (existingUsername) {
                throw new AppError('Username already exists', 409);
            }

            const existingEmail = await this.repository.findByEmail(data.email);
            if (existingEmail) {
                throw new AppError('Email already exists', 409);
            }
            // if not, then only create it
            const user = await this.repository.create({
                ...data,
                role: data.role,
            });
            // generate token based upon the generated user payload
            const token = await this.generateToken(user);

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

            logger.error('Error registering user', { error });
            throw new AppError('Error registering user', 500);
        }
    }

    async login(data: LoginInput): Promise<{ user: Partial<IUser>; token: string }> {
        try {
            //check if the username is correct
            const user = await this.repository.findByUsername(data.username);

            if (user?.isActive === false) {
                throw new AppError('User account is deactivated', 403);
            }
            // check if  the ppassword  is correct
            let isPasswordValid = false;
            if (user) {
                isPasswordValid = await bcrypt.compare(data.password, user.password);
            }
            if (!user || !isPasswordValid) {
                throw new AppError('Invalid username or password', 401);
            }

            const token = await this.generateToken(user);
            logger.info(`User logged in with username: ${user.username}`);
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
    async getProfile(userId: string): Promise<{ user: Partial<IUser> }> {
        try {
            // check if this is a custom error having a custom messgae
            const user = await this.repository.findById(userId);
            if (!user) {
                throw new AppError('User not found', 404);
            }
            return {
                user: {
                    _id: user._id,
                    email: user.email,
                    username: user.username,
                    clientId: user.clientId,
                    role: user.role,
                },
            };
        } catch (error) {
            if (error instanceof AppError) {
                throw error;
            }
            logger.error('Error fetching user profile', { error });
            // else throw a generic error message
            throw new AppError('Error fetching user profile', 500);
        }
    }
}
export default AuthService;
