import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { CircularProgress, Button, TextField } from '@mui/material';
import { ethers } from "ethers";
import toastr from 'toastr';

import NFTLayout from "../components/NFTLayout";
import { MARKETPLACE_ADDRESS } from "../constants";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import useUserCollections from "../hooks/useUserCollections";
import { NFTMetadata } from "../types/Interfaces";
import { parseBalance } from "../util";

const Profile = () => {
    const { account } = useWeb3React();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const {
        allCollections,
        isCollectionsFetched,
        fetchAllCollections,
    } = useUserCollections();
    const [tokens, setTokens] = useState<NFTMetadata[]>([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        const fetch = async () => {
            await fetchAllCollections(account);

            await fetchTokens();
        }

        fetch();

    }, [isCollectionsFetched]);

    const fetchTokens = async () => {
        const tokenArr = [];

        for (let index = 0; index < allCollections.length; index++) {
            const contract = await allCollections[index].collection;
            const collectionName = allCollections[index].name;
            const tokensLength = (await contract.tokenId())?.toString();
            console.log('tokensLength', tokensLength);
            

            for (let tokenId = 1; tokenId <= tokensLength; tokenId++) {
                const address = await contract.ownerOf(tokenId);

                if (address == account) {
                    const { isListed, price } = await marketplaceContract.listedItemStatus(contract.address, tokenId);
                    const token = await contract.tokenURI(tokenId);
                    const collectionOwner = await contract.owner();
                    const { status, data } = await axios.get(token);

                    if (status === 200) {
                        tokenArr.push({
                            ...data,
                            collectionName,
                            isListed,
                            price: parseBalance(price, 18, 2),
                            collectionIndex: allCollections[index].index,
                            itemAddress: contract.address,
                            collectionOwner,
                            tokenId
                        });
                    }
                }
            }
        }

        setTokens(tokenArr);
        setLoading(false);
    }

    const sellItem = async (e, index) => {
        const { collectionIndex, itemAddress, collectionOwner, tokenId, price } = tokens[index];

        if (price <= 0) {
            toastr.clear();
            toastr.warning('Value cannot be 0 or less!');
            return;
        }

        if (index < tokens.length && price !== 0) {
            setLoading(true);

            try {
                const contract = (allCollections.find((collection) => collection.address === itemAddress))?.collection;

                const isApproved = await contract.getApproved(tokenId);
                const isApprovedForAll = await contract.isApprovedForAll(account, marketplaceContract.address);

                if (/^0x0+$/.test(isApproved) && !isApprovedForAll) {
                    await (await contract.approve(marketplaceContract.address, tokenId)).wait();
                }

                await (await marketplaceContract.listItem(collectionOwner,
                    +collectionIndex,
                    +tokenId,
                    ethers.utils.parseEther(price.toString()),
                    { value: ethers.utils.parseEther('0.02') })
                ).wait();

                await fetchAllCollections(account);
                await fetchTokens();
            } catch (error) {
                toastr.error(error.message);
            }
            setLoading(false);
        }
    }

    const handlePriceChange = (e, index) => {
        tokens[index].price = e.target.value;
        setTokens([...tokens]);
    }

    const cancelSell = async () => {
    }

    return (
        <>
            {isLoading ? <CircularProgress className="position-center" style={{ left: '50%' }} /> : ''}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <h1>Profile</h1>
            </div>
            <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
                {tokens.map((token, index) => {
                    return (
                        <div key={index + 1}>
                            <NFTLayout
                                src={token.image}
                                key={index}
                                name={token.name}
                                description={token.description}
                                owner={account}
                                collectionName={token.collectionName}
                                collectionAddress={token.itemAddress}
                            />
                            <TextField
                                disabled={token.isListed}
                                style={{ marginLeft: '20px', width: '155px' }}
                                onChange={(e) => handlePriceChange(e, index)}
                                value={token.price}
                                type="number"
                                id="eth-price"
                                label="Price ETH"
                                variant="standard"
                            />
                            {
                                token.isListed ?
                                    <Button style={{ marginLeft: '20px' }} disabled={isLoading} onClick={cancelSell} variant="outlined">Cancel Sell</Button> :
                                    <Button style={{ marginLeft: '20px' }} disabled={isLoading} onClick={(e) => sellItem(e, index)} variant="outlined">Sell</Button>
                            }
                        </div>)
                })}
            </div>
        </>
    );
}

export default Profile;