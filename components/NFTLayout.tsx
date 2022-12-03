import * as React from 'react';
import { Box } from '@mui/material/';
import { useRouter } from 'next/router';
import Link from 'next/link';

import { shortenHex } from "../util";

const NFTLayout = (params) => {
    const router = useRouter();

    return (
        <Link href={{ pathname: "/nft", query: params }}>
            <Box className="nft-layout-box" sx={{ border: '1px dashed grey' }}>
                <img className="nft-img" src={params.src} />
                <div className="d-flex-column" style={{ padding: '10px', height: '40%' }}>
                    <div className="d-flex-column">
                        <span>{params.name}</span>
                        <span>{params.description}</span>
                    </div>
                    <div className="d-flex-column" style={{ paddingTop: '10px' }}>
                        {router.pathname.includes('profile') ?
                            <a>{shortenHex(params.owner, 4)}</a> :
                            <a className='pointer link' onClick={() => { router.push(`/user/${params.owner}`) }}>{shortenHex(params.owner, 4)}</a>
                        }
                        {
                            params.collectionAddress ?
                                <a className='pointer link' onClick={() => { router.push(`/collection/${params.owner}/${params.collectionAddress}`) }} href="javascript:void(0)">{params.collectionName}</a>
                                :
                                <span>
                                    {params.collectionName}
                                </span>
                        }
                    </div>
                </div>
            </Box>
        </Link>
    );
}

export default NFTLayout;