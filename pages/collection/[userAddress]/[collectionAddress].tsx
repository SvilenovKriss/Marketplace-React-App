import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { CircularProgress, Button } from '@mui/material';
import toastr from 'toastr';
import { useRouter } from 'next/router'
import { Contract } from "@ethersproject/contracts";

import NFTLayout from "../../../components/NFTLayout";
import { MARKETPLACE_ADDRESS } from "../../../constants";
import useMarketplaceContract from "../../../hooks/useMarketplaceContract";
import useUserCollections from "../../../hooks/useUserCollections";
import { NFTMetadata } from "../../../types/Interfaces";
import NFT_ABI from "../../../contracts/NFT.json";

const CollectionPage = (asd) => {
    const { library, account } = useWeb3React();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const { collectionContracts, isCollectionsFetched, fetchCollections } = useUserCollections();
    const router = useRouter();
    const { collectionAddress, userAddress } = router.query;
    const [tokens, setTokens] = useState<NFTMetadata[]>([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        // setLoading(true);

        const fetch = async () => {
            await fetchCollections(userAddress, collectionAddress?.toString());
            await fetchTokens();
        }

        fetch();
    }, [isCollectionsFetched]);

    const fetchTokens = async () => {
        const tokenArr = [];

        const contract = new Contract(collectionAddress as string, NFT_ABI, library.getSigner(account));
        const collectionName = await contract.name();
        const tokensLength = (await contract.tokenId())?.toString();

        for (let tokenId = 1; tokenId <= tokensLength; tokenId++) {
            const { isListed, price } = await marketplaceContract.listedItemStatus(contract.address, tokenId);
            const token = await contract.tokenURI(tokenId);
            const collectionOwner = await contract.owner();
            const { status, data } = await axios.get(token);

            if (status === 200) {
                tokenArr.push({
                    ...data,
                    collectionName,
                    isListed,
                    price,
                    collectionAddress: contract.address,
                    collectionOwner,
                    tokenId
                });
            }
        }

        //TODO: IF ITEM IS LISTED, SHOW BUY BUTTON, IF NOT, DONT.
        //TODO: CREATE THE PAGE BY USER AND SEE HOW TO REUSE THIS FUNCTIONALITY.
        //TODO: CREATE MAKE OFFER, CANCEL AND APPROVE.

        setTokens(tokenArr);
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

                    if (externalToken.tokenId.toString() == tokenId && collectionAddress == itemAddress) {
                        externalTokenIndex = i;
                        break;
                    }
                }
            }

            await (await marketplaceContract.buyItem(itemIndex, externalTokenIndex, { value: price })).wait();
            await fetchTokens();

            setLoading(false);
        } catch (error) {
            toastr.error(error.message);
        }
    }

    return (
        <>
            {isLoading ? <CircularProgress className="position-center" style={{ left: '50%' }} /> : ''}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <h1>By Collection</h1>
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
                            />
                            {
                                token.isListed ?
                                    <Button style={{ marginLeft: '20px' }} disabled={isLoading} onClick={(e) => buyToken(e, index)} variant="outlined">Buy</Button> : ''
                            }
                        </div>)
                })}
            </div>
        </>
    );
}

export default CollectionPage;