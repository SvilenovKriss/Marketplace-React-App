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

import { uploadFileToIPFS, uploadJSONToIPFS } from "../pinata";
import useUserCollections from "../hooks/useUserCollections";

const Mint = () => {
    const { account } = useWeb3React();
    const [isLoading, setLoading] = useState(false);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [collection, setCollection] = useState('');
    const [image, setImage] = useState<any>();
    const { collectionContracts, fetchCollections } = useUserCollections();

    useEffect(() => {
        setLoading(true);

        const fetch = async () => {
            await fetchCollections(account);

            setLoading(false);
        }

        fetch();
    }, [account]);

    const MintNft = async () => {
        if (!image || !name || !collection) {
            toastr.warning('Name, Image and Collection fields are required!');
            return;
        }

        setLoading(true);
        try {
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

            const contract = collectionContracts.find((collectionContract) => collectionContract?.collection.address == collection);

            const tx = await contract.collection.mint(responseIpfsJson.pinataURL);
            await tx.wait();
        } catch (error) {
            toastr.warning(error.message)
        }

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
            {isLoading ? <CircularProgress className="position-center" /> : ''}
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
                            collectionContracts.length > 0 ?
                                collectionContracts.map((collection, index) => {
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