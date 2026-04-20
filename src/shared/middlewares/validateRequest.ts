import type { NextFunction, Request, RequestHandler, Response } from 'express';
import type { ZodTypeAny,z } from 'zod';

const validateBody = <TSchema extends ZodTypeAny>(schema: TSchema): RequestHandler<{},{},z.infer<TSchema>> => {
    return (req: Request, _res: Response, next: NextFunction) => {
        const result = schema.safeParse(req.body);

        if (!result.success) {
            return next(result.error);
        }

        req.body = result.data;
        next();
    };
};

export default validateBody;
