import { useState } from "react";
import { useWeb3React } from "@web3-react/core";
import { Contract } from "@ethersproject/contracts";
import toastr from 'toastr';

import { MARKETPLACE_ADDRESS } from "../constants";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import NFT_ABI from "../contracts/NFT.json";

export default function useUserCollections() {
    const { library, account } = useWeb3React();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const [isCollectionsFetched, setCollectionStatus] = useState(false);
    const [collectionContracts, setCollectionContracts] = useState([]);
    const [allCollections, setAllCollections] = useState([]);

    const fetchCollections = async (address, specificCollectionAddrr = '') => {
        try {
            const collectionsLength = (await marketplaceContract?.getUserCollectionTotal(address))?.toString();
            const collections = [];

            for (let index = 1; index <= collectionsLength; index++) {
                const collectionAddress = await marketplaceContract?.getCollection(address, index);
                const _collection = new Contract(collectionAddress, NFT_ABI, library.getSigner(account));

                if (!specificCollectionAddrr.length || specificCollectionAddrr === collectionAddress) {
                    collections.push({ collection: _collection, name: await _collection.name(), address: _collection.address, index });

                    if (specificCollectionAddrr.length > 0) {
                        break;
                    }
                }

            }

            setCollectionContracts(collections);
            setCollectionStatus(true);
        } catch (err) {
            toastr.error(err.message);

            setCollectionStatus(true);
        }
    }

    const fetchAllCollections = async (address) => {
        try {
            //OWN COLLECTIONS.
            const collectionsLength = (await marketplaceContract?.getUserCollectionTotal(address))?.toString();
            const collections = [];

            for (let index = 1; index <= collectionsLength; index++) {
                const collectionAddress = await marketplaceContract?.getCollection(address, index);
                const _collection = new Contract(collectionAddress, NFT_ABI, library.getSigner(account));

                collections.push({ collection: _collection, name: await _collection.name(), address: _collection.address, index });
            }

            //TOKENS FROM EXTERNAL COLLECTIONS.
            const userBoughtTokensLength = (await marketplaceContract?.getTotalBoughtTokens(address))?.toString();

            for (let index = 0; index < userBoughtTokensLength; index++) {
                const { collectionAddress } = await marketplaceContract?.userBoughtTokens(address, index);
                const _collection = new Contract(collectionAddress, NFT_ABI, library.getSigner(account));
                const collectionOwner = await _collection.owner();
                const userCollectionsLength = (await marketplaceContract?.getUserCollectionTotal(collectionOwner))?.toString();

                for (let index = 1; index <= userCollectionsLength; index++) {
                    const externalTokenAddress = await marketplaceContract?.getCollection(collectionOwner, index);

                    if (collectionAddress === externalTokenAddress) {
                        const contractIndex = collections.findIndex((_coll) => _coll.address === externalTokenAddress)

                        //CHECKING IF I'VE ALREADY ADDED COLLECTION TO ARR.
                        if (contractIndex >= 0) {
                            break;
                        }

                        const _collection = new Contract(collectionAddress, NFT_ABI, library.getSigner(account));
                        collections.push({ collection: _collection, name: await _collection.name(), address: _collection.address, index });

                        break;
                    }
                }
            }

            setAllCollections(collections);
            setCollectionStatus(true)
        } catch (error) {
            toastr.error(error.message);
        }
    }

    return {
        collectionContracts,
        allCollections,
        isCollectionsFetched,
        fetchCollections,
        fetchAllCollections
    }
}