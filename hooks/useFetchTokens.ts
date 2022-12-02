import axios from "axios";

import { MARKETPLACE_ADDRESS } from "../constants";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { parseBalance } from "../util";

export default function useFetchTokens() {
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);

    const fetchTokens = async (allCollections, userAddress) => {
        const tokenArr = [];

        for (let index = 0; index < allCollections.length; index++) {
            const contract = await allCollections[index].collection;
            const collectionName = allCollections[index].name;
            const tokensLength = (await contract.tokenId())?.toString();

            for (let tokenId = 1; tokenId <= tokensLength; tokenId++) {
                const tokenOwner = await contract.ownerOf(tokenId);

                if (tokenOwner == userAddress) {
                    const { isListed, price } = await marketplaceContract.listedItemStatus(contract.address, tokenId);
                    const token = await contract.tokenURI(tokenId);
                    const collectionOwner = await contract.owner();
                    const { status, data } = await axios.get(token);

                    if (status === 200) {
                        tokenArr.push({
                            ...data,
                            collectionName,
                            isListed,
                            price: price.toString(),
                            collectionIndex: allCollections[index].index,
                            itemAddress: contract.address,
                            owner: tokenOwner,
                            collectionOwner,
                            tokenId
                        });
                    }
                }
            }
        }

        return tokenArr;
    }

    return {
        fetchTokens
    }
}