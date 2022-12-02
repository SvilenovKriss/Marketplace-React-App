import * as React from 'react';
import { Box } from '@mui/material/';
import { formatEtherscanLink, shortenHex } from "../util";
import { useRouter } from 'next/router';

const NFTLayout = ({ src, name, description, owner, collectionName, collectionAddress = null }) => {
    const router = useRouter();

    return (
        <Box className="nft-layout-box" sx={{ border: '1px dashed grey' }}>
            <img className="nft-img" src={src} />
            <div className="d-flex-column" style={{ padding: '10px', height: '40%' }}>
                <div className="d-flex-column">
                    <span>{name}</span>
                    <span>{description}</span>
                </div>
                <div className="d-flex-column" style={{ paddingTop: '10px' }}>
                    <span>{shortenHex(owner, 4)}</span>
                    {
                        collectionAddress ?
                            <span style={{ cursor: 'pointer' }} onClick={() => { router.push(`/collection/${owner}/${collectionAddress}`) }}>
                                <a href="javascript:void(0)">{collectionName} </a>
                            </span>
                            :
                            <span>
                                {collectionName}
                            </span>
                    }
                </div>
            </div>
        </Box>
    );
}

export default NFTLayout;