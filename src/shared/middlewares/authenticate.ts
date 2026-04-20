import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { IToken } from '../../services/auth/services/authService';
import config from '../config';
import logger from '../config/logger';
import ResponseFormatter from '../utils/responseFormatter';

const authenticate = async (req: Request, res: Response, next: NextFunction) => {
    try {
        let token = null;

        if (req.cookies && req.cookies.authToken) {
            token = req.cookies.authToken;
        }

        if (!token) {
            return res
                .status(401)
                .json(ResponseFormatter.error(401, 'Authentication token is required'));
        }

        const decoded = jwt.verify(token, config.jwt.secret) as IToken;

        req.user = { ...decoded };
        next();
    } catch (error) {
        logger.error('Authentication error', { error: error, path: req.path });

        if (error instanceof jwt.TokenExpiredError) {
            return res
                .status(401)
                .json(ResponseFormatter.error(401, 'Authentication token has expired'));
        }

        return res.status(401).json(ResponseFormatter.error(401, 'Invalid authentication token'));
    }
};

export default authenticate;
