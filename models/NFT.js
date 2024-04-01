const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nftSchema = new mongoose.Schema({
    name: String,
    uri: String,
    address: String,
});

module.exports = mongoose.model('nft', nftSchema);
