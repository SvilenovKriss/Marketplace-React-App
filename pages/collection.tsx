import { useEffect, useState } from "react";
import toastr from 'toastr';
import { useWeb3React } from "@web3-react/core";
import type { Web3Provider } from "@ethersproject/providers";
import { TextField, Box, Button, CircularProgress } from '@mui/material';
import { Contract } from "@ethersproject/contracts";

import useMarketplaceContract from "../hooks/useMarketplaceContract";
import { MARKETPLACE_ADDRESS } from "../constants";
import NFT_ABI from "../contracts/NFT.json";

const Collection = () => {
    const { account, library } = useWeb3React<Web3Provider>();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setLoading] = useState(false);

    const createCollection = async () => {
        if (name.length >= 1 && description.length >= 1) {
            try {
                const createCollectionTx = await marketplaceContract.createCollection(name, description);
                setLoading(true);

                await createCollectionTx.wait();

                const collectionsLength = (await marketplaceContract?.getUserCollectionTotal())?.toString();
                const collectionAddress = await marketplaceContract?.getCollection(collectionsLength);
                const _collection = new Contract(collectionAddress, NFT_ABI, library.getSigner(account));

                await _collection.setApprovalForAll(MARKETPLACE_ADDRESS, true);

                toastr.success('Collection created!');
            } catch (err) {
                toastr.error(err.message)
            }
        } else {
            toastr.warning('Name and description cannot be empty!')
        }
        setLoading(false);
        setName('');
        setDescription('');
    };

    return (
        <Box className="d-flex-center-column">
            {isLoading ? <CircularProgress style={{ position: 'absolute', top: '330px' }} /> : ''}
            <h1>Create collection</h1>
            <br />
            <TextField
                id="collection-name"
                label="Name"
                variant="outlined"
                value={name}
                onChange={(e: any) => setName(e.target.value)}
            />
            <TextField
                id="collection-description"
                label="description"
                style={{ margin: '15px 0', width: '210px' }}
                multiline
                rows={4}
                variant="outlined"
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
            />
            <Button disabled={isLoading} onClick={createCollection} variant="outlined">Create</Button>
        </Box>
    )
}

export default Collection;