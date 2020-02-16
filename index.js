let ethers = require('ethers')
let metaProxyABI = require('./MetaProxy.json').abi

const metaProxyAddress = "0xA45b491B7070c81a494cD8E03c5ddF37B6edF27A"

exports.handler = async (ev) => {

    if (ev.httpMethod === 'GET') {
        return success({ please: "use POST" })
    } else if (ev.httpMethod === 'POST') {
        const body = JSON.parse(ev.body)

        // parse metatx info
        const { metaTx } = body;

        // verify we want to pay for it
        let provider = ethers.getDefaultProvider("rinkeby")
        const metaProxyContract = new ethers.Contract(metaProxyAddress, metaProxyABI, provider)
        let mtxObj = await metaProxyContract.rawToMetaTx(metaTx)
        console.log(mtxObj)
        let metaSignerAddress = await metaProxyContract.verifySigner(mtxObj)
        console.log(metaSignerAddress)

        try {
            let funcSig = mtxObj.data.slice(0, 10)
            // let data = "0x" + mtxObj.data.slice(10)
            // console.log("funcSig", funcSig)
            // let abiCoder = ethers.utils.defaultAbiCoder
            // let decoded = abiCoder.decode(["bytes32", "string", "address", "address", "bytes"], data)

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
        let encodedMetaHash = ethers.utils.keccak256(encodedMeta)
        // sendTransaction
        // return txId
        console.log(process.env.SIGNER_PRIV_KEY)
        const signerWallet = new ethers.Wallet(process.env.SIGNER_PRIV_KEY, provider)

        let signature = await signerWallet.signMessage(ethers.utils.arrayify(encodedMetaHash))

        return success({ signature })
    }

}
const getFunctionSig = (funcName) => {
    ethers.utils.id(funcName).slice(0, 10)
}

const allowedFunctionSignatures = [
    getFunctionSig("join()"),
    getFunctionSig("submitProposal(string)"),
    getFunctionSig("voteForProposal(bytes32)"),
]

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