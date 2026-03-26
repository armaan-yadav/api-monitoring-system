import type { NextFunction, Request, Response } from 'express';
import type { RoleType } from '../constants/roles';
import ResponseFormatter from '../utils/responseFormatter';

const authorize =
    (allowedRoles: RoleType[]) => (req: Request, res: Response, next: NextFunction) => {
        try {
            if (!req.user || !req.user.role) {
                return res.status(403).json(ResponseFormatter.error(403, 'Forbidden'));
            }
            //skip  rolle chekcing
            if (allowedRoles.length === 0) {
                next();
            }

            //check role
            if (!allowedRoles.includes(req.user.role as RoleType)) {
                return res.status(403).json(ResponseFormatter.error(403, 'Permission Denied'));
            }

            next();
        } catch (error) {
            return res.status(403).json(ResponseFormatter.error(403, 'Forbidden'));
        }
    };
export default authorize;
