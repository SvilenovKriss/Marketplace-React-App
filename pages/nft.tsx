import { useState } from "react";
import { useRouter } from 'next/router'
import { Button } from '@mui/material';
import { useWeb3React } from "@web3-react/core";
import toastr from 'toastr';
import { Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper } from '@mui/material/';

import { parseBalance, shortenHex } from '../util';
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { MARKETPLACE_ADDRESS } from "../constants";

const NFTPage = () => {
    const { account } = useWeb3React();
    const [isLoading, setLoading] = useState(false);
    const [offers, setOffers] = useState([12]);
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const router = useRouter();

    const params = router.query;

    console.log(params);

    const buyToken = async () => {
        const { price, owner, tokenId, itemAddress, itemIndex } = params;

        try {
            setLoading(true);

            let externalTokenIndex = 0;

            if (account != owner) {
                const totalExternalTokens = await marketplaceContract.getTotalBoughtTokens(owner);

                for (let i = 0; i < totalExternalTokens; i++) {
                    const externalToken = await marketplaceContract?.userBoughtTokens(owner, i);

                    if (externalToken.tokenId.toString() == tokenId && externalToken.collectionAddress == itemAddress) {
                        externalTokenIndex = i;
                        break;
                    }
                }
            }

            console.log(itemIndex, externalTokenIndex, { value: price });

            // await (await marketplaceContract.buyItem(itemIndex, externalTokenIndex, { value: price })).wait();

        } catch (error) {
            toastr.error(error.message);
        }

        setLoading(false);
    }

    const makeOffer = async () => {}

    return (
        <div className='d-flex' style={{ padding: '3% 0 0 4%' }}>
            <div className='.d-flex-column'>
                <div className="image">
                    <img className="nft-img" src={params.src} style={{ width: '450px', height: '450px' }} />
                </div>
                <div className="d-flex-center-column">
                    <div>Name: {params.name}</div>
                    <div>Description: {params.description}</div>
                    <br />
                    <div>Owner: {shortenHex((params.owner as string), 4)}</div>
                    <div>Collection Name: {params.collectionName}</div>
                </div>
            </div>
            <div className='.d-flex-column'>
                {params.isListed === 'true' && account !== params.owner ? <Button style={{ marginLeft: '20px' }} onClick={buyToken} variant="outlined">Buy</Button> : ''}
                <span style={{ fontSize: '20px' }}> {parseBalance(params.price as string)} Ether</span>
                {account !== params.owner ?
                    <div style={{ marginTop: '10px' }}>
                        <Button style={{ marginLeft: '20px' }} onClick={makeOffer} variant="outlined">Make Offer</Button>
                    </div> : ''}
                <br />
                <div style={{ marginLeft: '20px' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 350 }} aria-label="simple table offers">
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Offered From</b></TableCell>
                                    <TableCell align="right"><b>Offered(ETH)</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {offers.map((row) => (
                                    <TableRow
                                        key={row.name}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            123321xxzczxc123
                                        </TableCell>
                                        <TableCell align="right">0.02</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </div>
    )
}

export default NFTPage;