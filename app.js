const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const NFT = require('./models/NFT');
const pinataSDK = require('@pinata/sdk');
const fs = require('fs');

const app = express();
const port = 3004;

mongoose.connect('mongodb://localhost:27017/NFT');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    },
});

const upload = multer({ storage });

const pinata = new pinataSDK(
    'a8bd0c03d1195c3d2d7b',
    '3de90fbbc2eedb0609c0ce2528098b7f86396c8b44670e5a5612049ba4ffd8dc'
);

const getContractABI = () => {
    return new Promise((resolve, reject) => {
        const artifactsPath = './artifacts/contracts/ERC721.sol/MyERC721.json';
        fs.readFile(artifactsPath, 'utf8', (error, contractJSON) => {
            if (error) {
                console.error('Error getting contract ABI:', error);
                reject(error);
            } else {
                const contractData = JSON.parse(contractJSON);
                const abi = contractData.abi;
                resolve(abi);
            }
        });
    });
};

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
    );
    res.header('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        res.header(
            'Access-Control-Allow-Methods',
            'PUT, POST, PATCH, DELETE, GET'
        );
        return res.status(200).json({});
    }
    next();
});

app.get('/contract-abi', (req, res) => {
    getContractABI()
        .then((abi) => {
            if (abi) {
                res.json({ abi });
            } else {
                res.status(500).json({
                    error: 'Failed to retrieve contract ABI.',
                });
            }
        })
        .catch((error) => {
            console.error('Error:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.post('/mint', upload.single('image'), async (req, res) => {
    try {
        const { name, description, address } = req.body;
        const fileStream = fs.createReadStream(req.file.path);
        const imagePinataResponse = await pinata.pinFileToIPFS(fileStream, {
            pinataMetadata: {
                name: req.file.originalname,
            },
        });

        const imageLink = `https://gateway.pinata.cloud/ipfs/${imagePinataResponse.IpfsHash}`;

        const metadata = {
            name,
            description,
            image: imageLink,
            address,
        };

        const metadataPinataResponse = await pinata.pinJSONToIPFS(metadata);
        const metadataCID = metadataPinataResponse.IpfsHash;
        const newToken = new NFT({
            name,
            description,
            image: imageLink,
            address,
            metadataCID: `ipfs://${metadataCID}`,
        });

        await newToken.save();

        res.status(200).json({
            message: 'Token minted successfully',
            metadataCID,
        });
    } catch (error) {
        console.error('Error minting tokens:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.get('/nft', async (req, res) => {
    NFT.find()
        .then((nfts) => {
            res.json(nfts);
        })
        .catch((err) => {
            console.error('Error recieveing NFTs', err);
            res.status(500).json({ error: 'Internal Server Error' });
        });
});

app.use('/uploads', express.static('uploads'));

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
