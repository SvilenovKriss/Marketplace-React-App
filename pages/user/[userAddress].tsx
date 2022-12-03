import { useEffect, useState } from "react";
import axios from "axios";
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/router'

import NFTLayout from "../../components/NFTLayout";
import { MARKETPLACE_ADDRESS } from "../../constants";
import useMarketplaceContract from "../../hooks/useMarketplaceContract";
import useUserCollections from "../../hooks/useUserCollections";
import { NFTMetadata } from "../../types/Interfaces";

const UserPage = () => {
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const { isCollectionsFetched, allCollections, fetchAllCollections } = useUserCollections();
    const router = useRouter();
    const { userAddress } = router.query;
    const [tokens, setTokens] = useState<NFTMetadata[]>([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        const fetch = async () => {
            await fetchAllCollections(userAddress);
            await fetchTokens();
        }

        fetch();

    }, [isCollectionsFetched]);

    const fetchTokens = async () => {
        try {
            const tokenArr = [];

            for (let i = 0; i < allCollections.length; i++) {
                setLoading(true);
                const contract = await allCollections[i].collection;
                const collectionName = allCollections[i].name;
                const tokensLength = (await contract.tokenId())?.toString();

                for (let tokenId = 1; tokenId <= tokensLength; tokenId++) {
                    const address = await contract.ownerOf(tokenId);

                    if (address == userAddress) {
                        const { isListed, price } = await marketplaceContract.listedItemStatus(contract.address, tokenId);
                        const token = await contract.tokenURI(tokenId);
                        const owner = await contract.ownerOf(tokenId);
                        const collectionOwner = await contract.owner();
                        const { status, data } = await axios.get(token);

                        if (status === 200) {
                            tokenArr.push({
                                ...data,
                                collectionName,
                                isListed,
                                price: price.toString(),
                                collectionIndex: allCollections[i].index,
                                itemAddress: contract.address,
                                collectionOwner,
                                owner,
                                tokenId
                            });
                        }
                    }
                }
            }

            setTokens(tokenArr);
        } catch (err) {
            console.log(err.message);
        }
        setLoading(false);
    }

    return (
        <>
            {isLoading ? <CircularProgress className="position-center" style={{ left: '50%' }} /> : ''}
            <div style={{ display: 'flex', justifyContent: 'center' }}>
                <h1>By User</h1>
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
                        </div>)
                })}
            </div>
        </>
    );
}

export default UserPage;