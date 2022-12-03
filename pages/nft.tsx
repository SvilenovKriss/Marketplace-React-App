import { useState, useEffect } from "react";
import { useRouter } from 'next/router'
import { Button } from '@mui/material';
import { useWeb3React } from "@web3-react/core";
import toastr from 'toastr';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    TextField,
    CircularProgress,
} from '@mui/material/';
import { ethers } from "ethers";

import { parseBalance, shortenHex } from '../util';
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { MARKETPLACE_ADDRESS } from "../constants";
import useUserCollections from "../hooks/useUserCollections";

const NFTPage = () => {
    const { account } = useWeb3React();
    const [isLoading, setLoading] = useState(false);
    const [offers, setOffers] = useState([12]);
    const [offerPrice, setOfferPrice] = useState(0);
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const { isCollectionsFetched, collectionContracts, fetchCollections } = useUserCollections();
    const [open, setOpen] = useState(false);
    const router = useRouter();

    const params = router.query;

    useEffect(() => {
        const fetch = async () => {
            await fetchOffers();
            await fetchCollections(params.collectionOwner, params.collectionAddress as string);
        }

        fetch();
    }, [isCollectionsFetched]);


    const handleClickOpen = () => {
        setOpen(true);
    };

    const handleClose = () => {
        setOpen(false);
    };

    const fetchOffers = async () => {
        try {
            const tokenffersLength = (await marketplaceContract.getTotalOffersByToken(params.collectionAddress, params.tokenId.toString())).toString();
            const fetchedOffers = [];

            for (let i = 0; i < tokenffersLength; i++) {
                const { offerFrom, offeredPrice } = await marketplaceContract.offers(params.collectionAddress, params.tokenId.toString(), i);

                fetchedOffers.push({ offerFrom, offeredPrice: offeredPrice.toString() });
            }
            setOffers(fetchedOffers);
        } catch (err) {
            console.log(err.message);
        }
    }

    const makeOffer = async () => {
        setLoading(true);
        if (offerPrice > 0) {
            try {
                handleClose();
                await (await marketplaceContract.makeOffer(params.collectionOwner,
                    params.collectionIndex || collectionContracts[0]?.index,
                    params.tokenId, { value: ethers.utils.parseEther(offerPrice.toString()) }
                )).wait();
                await fetchOffers();
            } catch (err) {
                toastr.error(err.message);
            }
        } else {
            toastr.warning('Price must be greater than 0.');
        }
        setLoading(false);
    }

    const cancelOffer = async (index) => {
        try {
            setLoading(true);
            await (await marketplaceContract.cancelOffer(params.collectionOwner,
                params.collectionIndex || collectionContracts[0]?.index,
                params.tokenId, index)).wait();

            await fetchOffers();
        } catch (err) {
            toastr.error(err.message);
        }

        setLoading(false);
    }

    const approveOffer = async () => {
        //TODO..
    }

    return (
        <div className='d-flex' style={{ padding: '3% 0 0 4%' }}>
            {isLoading ? <CircularProgress className="position-center" style={{ left: '50%' }} /> : ''}
            <div className='.d-flex-column'>
                <div className="image">
                    <img className="nft-img" src={params.src} style={{ width: '450px', height: '450px' }} />
                </div>
                <div className="d-flex-center-column">
                    <div>Name: {params.name}</div>
                    <div>Description: {params.description}</div>
                    <br />
                    <div>Owner: {shortenHex((!params.owner ? '' : params.owner as string), 4)}</div>
                    <div>Collection Name: {params.collectionName}</div>
                </div>
            </div>
            <div className='.d-flex-column'>
                {account !== params.owner ?
                    <div style={{ marginTop: '10px' }}>
                        <Button style={{ marginLeft: '20px' }} onClick={handleClickOpen} variant="outlined">Make Offer</Button>
                    </div> : ''}
                <br />
                <div style={{ marginLeft: '20px' }}>
                    <TableContainer component={Paper}>
                        <Table sx={{ minWidth: 350 }} aria-label="simple table offers">
                            <TableHead>
                                <TableRow>
                                    <TableCell><b>Offered From</b></TableCell>
                                    <TableCell align="right"><b>Offered(ETH)</b></TableCell>
                                    <TableCell align="right"><b>Actions</b></TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {offers.map((offer: any, index) => (
                                    <TableRow
                                        key={index}
                                        sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                    >
                                        <TableCell component="th" scope="row">
                                            {offer.offerFrom}
                                        </TableCell>
                                        <TableCell align="right">{offer.offeredPrice ? parseBalance(offer.offeredPrice) : ''}</TableCell>
                                        {
                                            params.owner === account ?
                                                <TableCell align="right">
                                                    <Button onClick={(e) => cancelOffer(index)} size="small" variant="contained">Cancel</Button >
                                                    <Button size="small" variant="contained" style={{ marginLeft: '5px' }}>Approve</Button >
                                                </TableCell> :
                                                account === offer.offerFrom ?
                                                    <TableCell align="right">
                                                        <Button onClick={(e) => cancelOffer(index)} size="small" variant="contained">Cancel</Button >
                                                    </TableCell>
                                                    : ''

                                        }
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
            <Dialog open={open} onClose={handleClose}>
                <DialogTitle>Offer</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        id="name"
                        label="Price"
                        type="number"
                        fullWidth
                        variant="standard"
                        onChange={(e: any) => setOfferPrice(e.target.value)}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button onClick={makeOffer}>Set</Button>
                </DialogActions>
            </Dialog>
        </div>
    )
}

export default NFTPage;