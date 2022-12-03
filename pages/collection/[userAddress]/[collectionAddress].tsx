import { useState, useEffect } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { CircularProgress } from '@mui/material';
import { useRouter } from 'next/router'
import { Contract } from "@ethersproject/contracts";

import NFTLayout from "../../../components/NFTLayout";
import { MARKETPLACE_ADDRESS } from "../../../constants";
import useMarketplaceContract from "../../../hooks/useMarketplaceContract";
import { NFTMetadata } from "../../../types/Interfaces";
import NFT_ABI from "../../../contracts/NFT.json";

const CollectionPage = () => {
    const { library, account } = useWeb3React();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const router = useRouter();
    const { collectionAddress, userAddress } = router.query;
    const [tokens, setTokens] = useState<NFTMetadata[]>([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        const fetch = async () => {
            await fetchTokens();
        }

        fetch()
    }, [])

    const fetchTokens = async () => {
        try {
            const tokenArr = [];

            const contract = new Contract(collectionAddress as string, NFT_ABI, library.getSigner(account));
            const collectionName = await contract.name();
            const tokensLength = (await contract.tokenId())?.toString();

            for (let tokenId = 1; tokenId <= tokensLength; tokenId++) {
                const { isListed, price } = await marketplaceContract.listedItemStatus(contract.address, tokenId);

                const token = await contract.tokenURI(tokenId);
                const collectionOwner = await contract.owner();
                const owner = await contract.ownerOf(tokenId);
                const { status, data } = await axios.get(token);

                if (status === 200) {
                    tokenArr.push({
                        ...data,
                        collectionName,
                        isListed,
                        price: price.toString(),
                        itemAddress: contract.address,
                        collectionOwner,
                        tokenId,
                        owner,
                    });
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
                <h1>By Collection</h1>
            </div>
            <div style={{ display: 'flex', flexFlow: 'row wrap' }}>
                {tokens.map((token, index) => {
                    return (
                        <div key={index + '1'}>
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

export default CollectionPage;