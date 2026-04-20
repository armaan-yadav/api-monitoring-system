import { BaseRepository } from '.';
import logger from '../../../shared/config/logger';
import User, { type IUser } from '../../../shared/models/User';

class MongoUserRepository extends BaseRepository<IUser> {
    constructor() {
        super(User);
    }

    override async create(data: Partial<IUser>): Promise<IUser> {
        try {
            let userData = { ...data };
            if (userData.role === 'super_admin' && !userData.permissions) {
                userData.permissions = {
                    canCreateApiKeys: true,
                    canExportData: true,
                    canManageUsers: true,
                    canViewAnalytics: true,
                };
            }
            const user = await new this.model(userData).save();
            logger.info(`User created: ${user._id} (${user.username})`);
            return user;
        } catch (error) {
            logger.error('Error creating user', { error });
            throw new Error('Error creating user', { cause: error });
        }
    }

    override async findById(id: string): Promise<IUser | null> {
        try {
            return this.model.findById(id).exec();
        } catch (error) {
            logger.error('Error finding user by ID', { error });
            throw new Error('Error finding user by ID', { cause: error });
        }
    }
    override findByUsername(username: string): Promise<IUser | null> {
        try {
            return this.model.findOne({ username }).exec();
        } catch (error) {
            logger.error('Error finding user by username', { error });
            throw new Error('Error finding user by username', { cause: error });
        }
    }

    override findByEmail(email: string): Promise<IUser | null> {
        try {
            return this.model.findOne({ email }).exec();
        } catch (error) {
            logger.error('Error finding user by email', { error });
            throw new Error('Error finding user by email', { cause: error });
        }
    }

    override async findAll(): Promise<IUser[]> {
        try {
            return this.model.find().select('-password').exec();
        } catch (error) {
            logger.error('Error finding all users', { error });
            throw new Error('Error finding all users', { cause: error });
        }
    }

    override async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
        try {
            const user = await this.model.findByIdAndUpdate(id, data, { new: true }).exec();
            if (user) logger.info(`User updated: ${id}`);
            return user;
        } catch (error) {
            logger.error('Error updating user', { error });
            throw new Error('Error updating user', { cause: error });
        }
    }

    override async delete(id: string): Promise<boolean> {
        try {
            const result = await this.model.findByIdAndDelete(id).exec();
            if (result) logger.info(`User deleted: ${id}`);
            return !!result;
        } catch (error) {
            logger.error('Error deleting user', { error });
            throw new Error('Error deleting user', { cause: error });
        }
    }
}

export default MongoUserRepository;
