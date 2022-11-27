import { useEffect, useState } from "react";
import { Contract } from "@ethersproject/contracts";
import { useWeb3React } from "@web3-react/core";
import {
    TextField,
    Box,
    Button,
    CircularProgress,
    MenuItem,
    FormControl,
    Select,
    SelectChangeEvent,
    InputLabel,
    Avatar
} from '@mui/material';
import toastr from 'toastr';

import { MARKETPLACE_ADDRESS } from "../constants";
import useMarketplaceContract from "../hooks/useMarketplaceContract";
import NFT_ABI from "../contracts/NFT.json";
import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";

const Mint = () => {
    const { library, account, chainId } = useWeb3React();
    const marketplaceContract = useMarketplaceContract(MARKETPLACE_ADDRESS);
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [collection, setCollection] = useState('');
    const [image, setImage] = useState<any>();
    const [collectionContracts, setCollectionContracts] = useState([]);
    const [userCollections, setUserCollections] = useState([]);

    useEffect(() => {
        const callFetchCollections = async () => {
            await fetchCollections();
        }

        callFetchCollections();
    }, []);

    const fetchCollections = async () => {
        const collectionsLength = (await marketplaceContract?.getUserCollectionTotal())?.toString();
        const collections = [];
        const collectionNames = [];
        for (let i = 1; i <= collectionsLength; i++) {
            try {
                const collectionAddress = await marketplaceContract?.getCollection(i);
                const _collection = new Contract(collectionAddress, NFT_ABI, library.getSigner(account));

                collectionNames.push({ name: await _collection.name(), address: _collection.address });
                collections.push(_collection);
            } catch (err) {
                toastr.error(err.message);
            }
        }

        setCollectionContracts(collections);
        setUserCollections(collectionNames);
    }

    const MintNft = async () => {
        if (!image || !name || !collection) {
            toastr.warning('Name, Image and Collection fields are required!');
            return;
        }

        setLoading(true);

        const responseIpfsFile: any = await uploadFileToIPFS(image);

        if (!responseIpfsFile?.success) {
            toastr.error(responseIpfsFile?.message);
            return;
        }

        const responseIpfsJson: any = await uploadJSONToIPFS({ image: responseIpfsFile?.pinataURL, name, description });

        if (!responseIpfsJson?.success) {
            toastr.error((responseIpfsJson as any)?.message);
            return;
        }

        const contract = collectionContracts.find((collectionContract) => collectionContract.address == collection);

        const tx = await contract.mint(responseIpfsJson.pinataURL);
        await tx.wait();

        setLoading(false);
        setImage('');
        setDescription('');
        setName('');
        setCollection('');
    }

    const handleChange = (event: SelectChangeEvent) => {
        setCollection(event.target.value as string);
    };

    return (
        <Box className="d-flex-center-column">
            {isLoading ? <CircularProgress style={{ position: 'absolute', top: '330px' }} /> : ''}
            <h1>Mint</h1>
            <div style={{ display: 'flex', justifyContent: 'flex-start', width: '430px', margin: '15px 0' }}>
                {
                    image
                        ?
                        <Avatar style={{ height: '100px', width: '100px' }} alt="Remy Sharp" src={window.URL.createObjectURL(new Blob([image], { type: "application/zip" }))} />
                        :
                        <Avatar style={{ height: '100px', width: '100px' }} alt="Remy Sharp" src={''} />
                }
                <div style={{ display: 'flex', justifyContent: 'flex-end', flexDirection: 'column', marginLeft: '5px' }}>
                    <Button style={{ width: '87px', height: '40px' }} variant="contained" component="label">
                        Upload
                        <input onChange={(e) => setImage(e.target.files[0])} hidden accept="image/*" multiple type="file" />
                    </Button>
                </div>
            </div>
            <div>
                <TextField
                    id="collection-name"
                    label="Name"
                    variant="outlined"
                    value={name}
                    onChange={(e: any) => setName(e.target.value)}
                />
                <FormControl style={{ width: '210px', marginLeft: '10px' }}>
                    <InputLabel id="demo-simple-select-label">Collection</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={collection}
                        label="Collection"
                        onChange={handleChange}
                    >
                        {
                            userCollections.length > 0 ?
                                userCollections.map((collection, index) => {
                                    return <MenuItem key={index} value={collection.address}>{collection.name}</MenuItem>
                                }) : <MenuItem disabled value="no colletion">No collections!</MenuItem>
                        }
                    </Select>
                </FormControl>
            </div>
            <TextField
                id="collection-description"
                label="description"
                style={{ margin: '15px 0', width: '430px' }}
                multiline
                rows={4}
                variant="outlined"
                value={description}
                onChange={(e: any) => setDescription(e.target.value)}
            />
            <Button disabled={isLoading} onClick={MintNft} variant="outlined">Mint</Button>
        </Box>
    )
}

export default Mint;