class ResponseFormatter {
    static success(data: any = null, message: string = 'Success', statusCode: number = 200) {
        return {
            success: true,
            message,
            data,
            statusCode,
            timeStamp: new Date().toISOString(),
        };
    }
    static error(message: string = 'Error', statusCode: number = 500, error: any = null) {
        return {
            success: false,
            message,
            error,
            statusCode,
            timeStamp: new Date().toISOString(),
        };
    }

    static validationError(
        message: string = 'Validation Error',
        statusCode: number = 400,
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
