import { useEffect, useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { CircularProgress, Button } from '@mui/material';
import { Contract } from "@ethersproject/contracts";
import axios from "axios";
import toastr from 'toastr';
import { ethers } from "ethers";

import { MARKETPLACE_ADDRESS } from "../constants";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import NFTLayout from "../components/NFTLayout";
import NFT_ABI from "../contracts/NFT.json";
import { parseBalance } from "../util";

const Home = () => {
    const { library, account, chainId } = useWeb3React();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const [tokens, setTokens] = useState([]);
    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
        setLoading(true);

        const fetch = async () => {
            await fetchListedItems();
        }

        fetch();
    }, []);

    const fetchListedItems = async () => {
        const totalListed = (await marketplaceContract?.getTotalListedItems())?.toString();
        const tokensArr = [];
        for (let index = 0; index < totalListed; index++) {
            const { collectionAddress, tokenId, price } = await marketplaceContract.listedItems(index);
            const contract = new Contract(collectionAddress, NFT_ABI, library.getSigner(account));
            const token = await contract.tokenURI(tokenId);
            const collectionName = await contract.name();
            const owner = await contract.ownerOf(tokenId);
            const { status, data } = await axios.get(token);

            if (status === 200) {
                tokensArr.push({ ...data, price: price.toString(), collectionName, token: tokenId, owner, itemAddress: collectionAddress });
            }
        }

        setTokens(tokensArr);
        setLoading(false);
    }

    const buyToken = async (e, itemIndex) => {
        const { price, owner, token, itemAddress } = tokens[itemIndex];

        try {
            setLoading(true);

            let externalTokenIndex = 0;

            if (account != owner) {
                const totalExternalTokens = await marketplaceContract.getTotalBoughtTokens(owner);

                for (let i = 0; i < totalExternalTokens; i++) {
                    const { collectionAddress, tokenId } = await marketplaceContract?.userBoughtTokens(owner, i);

                    if (tokenId.toString() == token && collectionAddress == itemAddress) {
                        externalTokenIndex = i;
                        break;
                    }
                }
            }

            await (await marketplaceContract.buyItem(itemIndex, externalTokenIndex, { value: price })).wait();
            await fetchListedItems();

            setLoading(false);
        } catch (error) {
            toastr.error(error.message);
        }
    }

    return (
        <>
            {isLoading ? <CircularProgress className="position-center" style={{ left: '50%' }} /> : ''}
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
                            />
                            {
                                account !== token.owner ?
                                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                        < Button style={{ marginLeft: '20px' }} disabled={isLoading} onClick={(e) => buyToken(e, index)} variant="outlined">Buy</Button>
                                        <span style={{ marginRight: '20px' }}>Price: {parseBalance(token.price, 18, 2)}</span>
                                    </div>
                                    : ''
                            }
                        </div>
                    )
                })}
            </div>
        </>
    )
}

export default Home;