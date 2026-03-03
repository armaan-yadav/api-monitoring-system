import bcrypt from 'bcryptjs';
import type { HydratedDocument } from 'mongoose';
import mongoose from 'mongoose';
import SecurityUtils from '../utils/securityUtils';
import { emailValidator } from '../utils/validatorsUtils';

interface IUser {
    username: string;
    email: string;
    password: string;
    role: 'super_admin' | 'client_admin' | 'client_viewer';
    clientId?: mongoose.Types.ObjectId;
    isActive: boolean;
    permissions: {
        canCreateApiKeys: boolean;
        canManageUsers: boolean;
        canViewAnalytics: boolean;
        canExportData: boolean;
    };
}

type UserDocument = HydratedDocument<IUser>;

const userSchema = new mongoose.Schema<IUser>(
    {
        username: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            minlength: 3,
            validate: {
                validator: function (value: string) {
                    return /^[a-zA-Z0-9_.-]+$/.test(value);
                },
                message: 'Please enter a valid username',
            },
        },
        email: {
            type: String,
            unique: true,
            required: true,
            trim: true,
            lowercase: true,
            validate: {
                validator: emailValidator,
                message: 'Please enter a valid email address',
            },
        },
        password: {
            type: String,
            minlength: 6,
            validate: {
                validator: function (this: UserDocument, password: string): boolean {
                    if (this.isModified('password') && password && !password.startsWith('$2a$')) {
                        const validation = SecurityUtils.validatePassword(password);
                        return validation.success;
                    }
                    return true;
                },
                message: function (props: mongoose.ValidatorProps): string {
                    const value = props.value as string;
                    if (value && !value.startsWith('$2a$')) {
                        const validation = SecurityUtils.validatePassword(value);
                        return validation.errors.join('.');
                    }
                    return 'Password validation failed';
                },
            } as mongoose.ValidateOpts<string, UserDocument>,
        },
        role: {
            type: String,
            enum: ['super_admin', 'client_admin', 'client_viewer'],
            default: 'client_viewer',
        },
        clientId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Client',
            required: function (this: UserDocument) {
                return this.role !== 'super_admin';
            },
        },
        isActive: {
            type: Boolean,
            default: true,
        },
        permissions: {
            canCreateApiKeys: { type: Boolean, default: false },
            canManageUsers: { type: Boolean, default: false },
            canViewAnalytics: { type: Boolean, default: true },
            canExportData: { type: Boolean, default: false },
        },
    },
    {
        timestamps: true,
        collection: 'users',
    }
);

userSchema.pre<UserDocument>('save', async function () {
    if (!this.isModified('password')) {
        return;
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.index({ clientId: 1, isActive: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model('User', userSchema);
export default User;
