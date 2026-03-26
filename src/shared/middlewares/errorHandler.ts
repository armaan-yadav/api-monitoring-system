import type { NextFunction, Request, Response } from 'express';
import { ZodError } from 'zod';
import logger from '../config/logger.js';
import ResponseFormatter from '../utils/responseFormatter.js';

export interface AppError extends Omit<Error, 'errors'> {
    statusCode?: number;
    errors?: Record<string, { message: string }> | null;
    code?: number;
}

type ValidationPayload = {
    type: 'VALIDATION_ERROR';
    fields: Record<string, string[]>;
    formErrors: string[];
};

const getPathKey = (path: PropertyKey[]) => {
    if (path.length === 0) {
        return '';
    }

    return path
        .map((segment) => (typeof segment === 'symbol' ? segment.toString() : String(segment)))
        .join('.');
};

const createValidationPayload = (): ValidationPayload => ({
    type: 'VALIDATION_ERROR',
    fields: {},
    formErrors: [],
});

const addFieldError = (payload: ValidationPayload, field: string, message: string) => {
    if (!payload.fields[field]) {
        payload.fields[field] = [];
    }

    payload.fields[field].push(message);
};

const zodToValidationPayload = (error: ZodError): ValidationPayload => {
    const payload = createValidationPayload();

    error.issues.forEach((issue) => {
        const key = getPathKey(issue.path);
        if (!key) {
            payload.formErrors.push(issue.message);
            return;
        }

        addFieldError(payload, key, issue.message);
    });

    return payload;
};

const mongooseValidationToPayload = (
    errors?: Record<string, { message: string }> | null
): ValidationPayload => {
    const payload = createValidationPayload();

    if (!errors) {
        return payload;
    }

    Object.entries(errors).forEach(([field, details]) => {
        addFieldError(payload, field, details.message);
    });

    return payload;
};

const errorHandler = (err: AppError, req: Request, res: Response, _next: NextFunction) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal server error';
    let errors: unknown = null;

    if (err instanceof ZodError) {
        statusCode = 400;
        message = 'Validation failed';
        errors = zodToValidationPayload(err);
    } else if (err.name === 'ValidationError') {
        statusCode = 400;
        message = 'Validation failed';
        errors = mongooseValidationToPayload(err.errors);
    } else if (err.name === 'MongoServerError' && err.code === 11000) {
        statusCode = 409;
        message = 'Duplicate key error';
    } else if (err.name === 'JsonWebTokenError') {
        statusCode = 401;
        message = 'Invalid token';
    } else if (err.name === 'TokenExpiredError') {
        statusCode = 401;
        message = 'Token expired';
    }

    if (statusCode >= 500) {
        logger.error('Error occurred:', {
            message,
            statusCode,
            stack: err.stack,
            path: req.path,
            method: req.method,
        });
    } else {
        logger.warn('Handled request error', {
            message,
            statusCode,
            path: req.path,
            method: req.method,
            errors,
        });
    }

    res.status(statusCode).json(ResponseFormatter.error(statusCode, message, errors));
};

export default errorHandler;
