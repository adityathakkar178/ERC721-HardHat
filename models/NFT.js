const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nftSchema = new mongoose.Schema({
    name: String,
    description: String,
    image: String,
    address: String,
    metadataCID: String,
});


module.exports = mongoose.model('nft', nftSchema);
