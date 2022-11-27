export interface PinataSuccessResponse {
    success: boolean;
    pinataURL: string;
}

export interface PinataErrorResponse {
    success: boolean;
    message: any;
}