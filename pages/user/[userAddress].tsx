import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import axios from "axios";
import { CircularProgress, Button } from '@mui/material';
import toastr from 'toastr';
import { useRouter } from 'next/router'
import { Contract } from "@ethersproject/contracts";

import NFTLayout from "../../components/NFTLayout";
import { MARKETPLACE_ADDRESS } from "../../constants";
import useMarketplaceContract from "../../hooks/useMarketplaceContract";
import useUserCollections from "../../hooks/useUserCollections";
import { NFTMetadata } from "../../types/Interfaces";
import NFT_ABI from "../../contracts/NFT.json";
import { parseBalance } from "../../util";
import useFetchTokens from "../../hooks/useFetchTokens";

const UserPage = () => {
    const { library, account } = useWeb3React();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const { isCollectionsFetched, allCollections, fetchAllCollections } = useUserCollections();
    const router = useRouter();
    const { userAddress } = router.query;
    const [tokens, setTokens] = useState<NFTMetadata[]>([]);
    const [isLoading, setLoading] = useState(false);
    const { fetchTokens } = useFetchTokens();

    useEffect(() => {
        setLoading(true);

        const fetch = async () => {
            await fetchAllCollections(userAddress);
            const res = await fetchTokens(allCollections, userAddress);

            if (res?.length > 0) {
                setTokens(res);
                setLoading(false);
            }

        }

        fetch();
    }, [isCollectionsFetched]);

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
            await fetchAllCollections(userAddress);

            setLoading(false);
        } catch (error) {
            toastr.error(error.message);
        }
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
                        <div style={{ cursor: 'pointer' }} key={index + 1}>
                            <NFTLayout
                                src={token.image}
                                key={index}
                                name={token.name}
                                description={token.description}
                                owner={token.owner}
                                collectionName={token.collectionName}
                                collectionAddress={token.itemAddress}
                            />
                            {
                                token.isListed ?
                                    token.owner === account ?
                                        <div className="d-flex-space-between">
                                            <Button style={{ marginLeft: '20px' }} disabled onClick={(e) => buyToken(e, index)} variant="outlined">Buy</Button>
                                            <span style={{ marginRight: '20px' }}>Price: {parseBalance(token.price, 18, 2)}</span>
                                        </div> :
                                        <div className="d-flex-space-between">
                                            <Button style={{ marginLeft: '20px' }} disabled={isLoading} onClick={(e) => buyToken(e, index)} variant="outlined">Buy</Button>
                                            <span style={{ marginRight: '20px' }}>Price: {parseBalance(token.price, 18, 2)}</span>
                                        </div>
                                    : ''
                            }
                        </div>)
                })}
            </div>
        </>
    );
}

export default UserPage;