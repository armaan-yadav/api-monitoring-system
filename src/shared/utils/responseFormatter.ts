class ResponseFormatter {
    static success(statusCode: number = 200, message: string = 'Success', data: any = null) {
        return {
            success: true,
            message,
            data,
            statusCode,
            timeStamp: new Date().toISOString(),
        };
    }
    static error(statusCode: number = 500, message: string = 'Error', error: any = null) {
        return {
            success: false,
            message,
            error,
            statusCode,
            timeStamp: new Date().toISOString(),
        };
    }

    static validationError(
        statusCode: number = 400,
        message: string = 'Validation Error',
        error: any = null
    ) {
        return {
            success: false,
            message,
            error,
            statusCode,
            timeStamp: new Date().toISOString(),
        };
    }
    static paginated(data: any = null, page: number, total: number, limit: number) {
        return {
            success: true,
            data,
            pagination: {
                page,
                total,
                limit,
                totalPages: Math.ceil(total / limit),
            },
            timeStamp: new Date().toISOString(),
        };
    }
}
export default ResponseFormatter;
