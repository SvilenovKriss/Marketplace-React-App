import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { CircularProgress, Button } from '@mui/material';
import { Contract } from "@ethersproject/contracts";
import axios from "axios";
import toastr from 'toastr';

import { MARKETPLACE_ADDRESS } from "../constants";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import NFTLayout from "../components/NFTLayout";
import NFT_ABI from "../contracts/NFT.json";
import { parseBalance } from "../util";
import { NFTMetadata } from "../types/Interfaces";

const Home = () => {
    const { library, account } = useWeb3React();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const [tokens, setTokens] = useState<NFTMetadata[]>([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        const fetch = async () => {
            await fetchListedItems();
        }

        fetch();
    }, [account]);

    const fetchListedItems = async () => {
        try {
            const totalListed = (await marketplaceContract?.getTotalListedItems())?.toString();
            const tokensArr = [];
            for (let index = 0; index < totalListed; index++) {
                const { collectionAddress, tokenId, price } = await marketplaceContract.listedItems(index);
                const contract = new Contract(collectionAddress, NFT_ABI, library.getSigner(account));

                const token = await contract.tokenURI(tokenId);
                const collectionName = await contract.name();
                const collectionOwner = await contract.owner();
                const owner = await contract.ownerOf(tokenId);
                const { status, data } = await axios.get(token);

                if (status === 200) {
                    tokensArr.push({
                        ...data,
                        price: price.toString(),
                        collectionName,
                        tokenId: tokenId.toString(),
                        owner,
                        itemAddress: collectionAddress,
                        collectionOwner,
                        itemIndex: index,
                        isListed: true
                    });
                }
            }

            setTokens(tokensArr);
        } catch (err) {
            toastr.error(err.message);
        }

        setLoading(false);
    }

    const buyToken = async (e, itemIndex) => {
        const { price, owner, tokenId, itemAddress } = tokens[itemIndex];

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

            await (await marketplaceContract.buyItem(itemIndex, externalTokenIndex, { value: price })).wait();
            await fetchListedItems();

        } catch (error) {
            toastr.error(error.message);
        }

        setLoading(false);
    }

    return (
        <>
            {isLoading ? <CircularProgress className="position-center" style={{ left: '50%' }} /> : ''}
            {
                account?.length > 0 ?
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'center' }}>
                            <h1>Home</h1>
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
                                            owner={token.owner}
                                            collectionName={token.collectionName}
                                            collectionAddress={token.itemAddress}
                                            collectionOwner={token.collectionOwner}
                                            collectionIndex={token.collectionIndex}
                                            itemIndex={token.itemIndex}
                                            price={token.price}
                                            tokenId={token.tokenId}
                                            isListed={token.isListed}
                                        />
                                        {
                                            account !== token.owner ?
                                                <div className="d-flex-space-between">
                                                    < Button style={{ marginLeft: '20px' }} disabled={isLoading} onClick={(e) => buyToken(e, index)} variant="outlined">Buy</Button>
                                                    <span style={{ marginRight: '20px' }}>Price: {token.price ? parseBalance(token.price) : ''}</span>
                                                </div>
                                                : ''
                                        }
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                    :
                    <div className="d-flex-center-column">
                        <h1>This is NFT Market Place</h1>
                        <div className="d-flex">
                            <h3>You can use this marketplace to create, buy & sell NFTs.</h3>
                        </div>
                        <div className="d-flex">
                            <h3>Please connect to your Wallet!</h3>
                        </div>
                    </div>
            }
        </>
    )
}

export default Home;