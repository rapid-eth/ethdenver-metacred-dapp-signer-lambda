let ethers = require('ethers')
let metaProxyABI = require('./MetaProxy.json').abi

//TODO
const depmetaProxyAddress = "0xA45b491B7070c81a494cD8E03c5ddF37B6edF27A"
const metaProxyAddress = "0x56A6096210cEA8665067611A189B641D6Ea6D810"

exports.handler = async (ev) => {

    if (ev.httpMethod === 'GET') {
        return success({ please: "use POST" })
    } else if (ev.httpMethod === 'POST') {
        const body = JSON.parse(ev.body)

        // parse metatx info
        const { metaTx } = body;

        // verify we want to pay for it
        let provider = ethers.getDefaultProvider("rinkeby")
        const metaProxyContract = new ethers.Contract(depmetaProxyAddress, metaProxyABI, provider)
        let mtxObj = await metaProxyContract.rawToMetaTx(metaTx)
        console.log(mtxObj)
        let metaSignerAddress = await metaProxyContract.verifySigner(mtxObj)
        console.log(metaSignerAddress)
        const allowedFunctionSignatures = [
            ethers.utils.id("join()").slice(0, 10),
            ethers.utils.id("submitProposal(string)").slice(0, 10),
            ethers.utils.id("voteForProposal(bytes32)").slice(0, 10),
        ]
        try {
            let funcSig = mtxObj.data.slice(0, 10)
            console.log("thefuncsig "+funcSig)
            // let data = "0x" + mtxObj.data.slice(10)
            // console.log("funcSig", funcSig)
            // let abiCoder = ethers.utils.defaultAbiCoder
            // let decoded = abiCoder.decode(["bytes32", "string", "address", "address", "bytes"], data)
            console.log(allowedFunctionSignatures)

            // verify that function sig matches allowed function calls
            if (!allowedFunctionSignatures.includes(funcSig)) {
                console.log("FUNC SIG did not match")
                return fail("FUNC SIG not allowed");
            }

        } catch (error) {
            console.log("shit")
        }

        let abiCoder = ethers.utils.defaultAbiCoder
        //TODO CHECK tHIS WORKS
        let encodedMeta = abiCoder.encode(["address", "bytes"], [metaProxyAddress, metaTx])
        console.log(encodedMeta, "encodedMeta")

        let encodedMetaHash = ethers.utils.keccak256(encodedMeta)

        console.log(encodedMetaHash, "encodedMetaHash")
        // sendTransaction
        // return txId
        // const signerWallet = new ethers.Wallet(process.env.SIGNER_PRIV_KEY, provider)
        let DDA_PK = ethers.utils.id("dapp dev")
        
        let dappDevAccount = new ethers.Wallet(DDA_PK, provider)
        console.log(dappDevAccount.address)

        let signerWallet = dappDevAccount
        let signature = await signerWallet.signMessage(ethers.utils.arrayify(encodedMetaHash))

        return success({ signature })
    }

}


const success = (s) => {
    return {
        headers: {
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: 200,
        body: JSON.stringify(s) || "ok",
    }
}

const fail = (reason, code) => {
    return {
        headers: {
            "Access-Control-Allow-Headers": "Origin, X-Requested-With, Content-Type, Accept",
            "Access-Control-Allow-Origin": "*"
        },
        statusCode: code || 400,
        body: JSON.stringify({ error: reason }),
    }
}