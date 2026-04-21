import { z } from 'zod';
import SecurityUtils from '../../../shared/utils/securityUtils';
import { ROLES } from '../../../shared/constants/roles';

const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

const usernameField = z
    .string()
    .trim()
    .min(1, 'Username is required')
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(usernameRegex, 'Please enter a valid username')
    .refine(
        (val) => !val.startsWith('.') && !val.endsWith('.'),
        'Username cannot start or end with a dot'
    )
    .refine((val) => !val.includes('..'), 'Username cannot contain consecutive dots');

const emailField = z
    .string()
    .trim()
    .min(1, 'Email is required')
    .max(255, 'Email is too long')
    .toLowerCase()
    .email('Please enter a valid email address');

const passwordField = z.string().min(1, 'Password is required').max(128, 'Password is too long');

export const onboardSuperAdminSchema = z
    .object({
        username: usernameField,
        email: emailField,
        password: passwordField,
    })
    .strict()
    .superRefine((data, ctx) => {
        const passwordValidation = SecurityUtils.validatePassword(data.password);
        if (!passwordValidation.success) {
            passwordValidation.errors.forEach((errorMessage) => {
                ctx.addIssue({
                    code: z.ZodIssueCode.custom,
                    path: ['password'],
                    message: errorMessage,
                });
            });
        }
    });

export const registerSchema = z
    .object({
        username: usernameField,
        email: emailField,
        password: passwordField,
        role: z.enum([ROLES.CLIENT_ADMIN, ROLES.CLIENT_VIEWER, ROLES.SUPER_ADMIN]),
    })
    .strict();

export const loginSchema = z
    .object({
        username: usernameField,
        password: passwordField,
    })
    .strict();

// ── Types ────────────────────────────────────────────────────────────
export type OnboardSuperAdminInput = z.infer<typeof onboardSuperAdminSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;