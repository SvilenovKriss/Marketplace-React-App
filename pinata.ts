import axios from 'axios';
import FormData from 'form-data';

const PINATA_KEY = process.env.PINATA_KEY;
const PINATA_API_SECRET = process.env.PINATA_API_SECRET;

export const uploadJSONToIPFS = async (JSONBody) => {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    return axios
        .post(url, JSONBody, {
            headers: {
                pinata_api_key: PINATA_KEY,
                pinata_secret_api_key: PINATA_API_SECRET,
            }
        })
        .then(function (response) {
            return {
                success: true,
                pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
            };
        })
        .catch(function (error) {
            console.log(error)
            return {
                success: false,
                message: error.message,
            }

        });
};

export const uploadFileToIPFS = async (file) => {
    console.log(PINATA_API_SECRET, PINATA_KEY);
    const formData = new FormData();
    formData.append("file", file);

    return await axios({
        method: "post",
        url: "https://api.pinata.cloud/pinning/pinFileToIPFS",
        data: formData,
        headers: {
            'pinata_api_key': `${process.env.PINATA_KEY}`,
            'pinata_secret_api_key': `${process.env.PINATA_API_SECRET}`,
            "Content-Type": "multipart/form-data"
        },
    }).then(function (response) {
        return {
            success: true,
            pinataURL: "https://gateway.pinata.cloud/ipfs/" + response.data.IpfsHash
        };
    }).catch(function (error) {
        return {
            success: false,
            message: error.message,
        };
    });
};