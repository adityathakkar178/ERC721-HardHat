const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const nftSchema = new mongoose.Schema({
    name: String,
    uri: String,
    image: String,
});

module.exports = mongoose.model('nft', nftSchema);
