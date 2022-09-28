const express = require('express')
const bodyParser = require("body-parser");
const router = express.Router();
const ethers = require('ethers')
var fs = require('fs');
var jsonFile = "../hardhat/artifacts/contracts/Boomerang.sol/Boomerang.json";
var parsed = JSON.parse(fs.readFileSync(jsonFile));
var abi = parsed.abi;

const app = express();

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use("/",router);

const provider = new ethers.providers.JsonRpcProvider("https://goerli.infura.io/v3/a035e52afe954afe9c45e781080cde98");
const signer = new ethers.Wallet("2ccfe123b7e5a3f6672cc6956f3c25b7fa25df1365cf0879a207756a68ac3f8b", provider);
const boomerang = new ethers.Contract("0x6F9049c097A9812C3256302619793E5d94B6Cfe1", abi, signer);

console.log("Relaying at ", boomerang.address + " wtih " + signer);

router.get('/',(req, res) => {
    res.send("Ok");
});

router.post('/relay', async (req, res) => {
    var data = req.body.data;
    var signature = req.body.signature;
    console.log("Request received");
    // const tx = await boomerang.callWithSignature(data, signature);
    const tx = await boomerang.increment();
    console.log("Sending tx " + tx.hash)
    await tx.wait();
    console.log("Confirmed")
    res.end("Transaction relayed");
});

app.listen(3333, () => {  
    console.log("Relayer listening for requests...")       
})