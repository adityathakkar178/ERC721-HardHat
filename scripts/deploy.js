async function main() {
    const [deployer] = await ethers.getSigners();
    const MyERC721 = await ethers.getContractFactory('MyERC721');
    const myERC721 = await MyERC721.deploy();
    console.log({myERC721}, myERC721.address);
}

main()
    .then(() => process.exit(0))
    .catch(error => {
        console.error(error);
        process.exit(1);
    });