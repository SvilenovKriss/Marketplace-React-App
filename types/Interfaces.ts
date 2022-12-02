export interface PinataSuccessResponse {
    success: boolean;
    pinataURL: string;
}

export interface PinataErrorResponse {
    success: boolean;
    message: any;
}

export interface NFTMetadata {
    description: string;
    image: string;
    name: string;
    collectionName: string;
    collectionOwner: string;
    collectionAddress: string;
    itemAddress: string;
    owner: string;
    collectionIndex: number;
    isListed: boolean;
    price: number;
    itemIndex?: number;
    tokenId: number;
}