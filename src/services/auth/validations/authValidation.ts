import { z } from 'zod';
import SecurityUtils from '../../../shared/utils/securityUtils';

const usernameRegex = /^[a-zA-Z0-9_.-]+$/;

export const onboardSuperAdminSchema = z
    .object({
        username: z
            .string()
            .trim()
            .min(1, 'Username is required')
            .min(3, 'Username must be at least 3 characters')
            .regex(usernameRegex, 'Please enter a valid username'),
        email: z
            .string()
            .trim()
            .min(1, 'Email is required')
            .toLowerCase()
            .email('Please enter a valid email address'),
        password: z.string().min(1, 'Password is required'),
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

export type OnboardSuperAdminInput = z.infer<typeof onboardSuperAdminSchema>;
