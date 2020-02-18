let ethers = require('ethers')
let metaProxyABI = require('./MetaProxy.json').abi

//TODO
const depmetaProxyAddress = "0xA45b491B7070c81a494cD8E03c5ddF37B6edF27A"

exports.dappSigner = async (metaTransaction) => {
    const metaProxyAddress = "0x2453a358dAb6fC7d87E56b9052C840A680588C8e"
    // verify we want to pay for it
    let provider = ethers.getDefaultProvider("rinkeby")
    const metaProxyContract = new ethers.Contract(depmetaProxyAddress, metaProxyABI, provider)
    let mtxObj = await metaProxyContract.rawToMetaTx(metaTransaction)
    console.log(mtxObj)
    let metaSignerAddress = await metaProxyContract.verifySigner(mtxObj)
    console.log(metaSignerAddress)
    const allowedFunctionSignatures = [
        ethers.utils.id("join()").slice(0, 10),
        ethers.utils.id("submitProposal(string)").slice(0, 10),
        ethers.utils.id("voteForProposal(bytes32)").slice(0, 10),
    ]

    let funcSig = mtxObj.data.slice(0, 10)
    console.log("thefuncsig " + funcSig)
    console.log(allowedFunctionSignatures)

    // verify that function sig matches allowed function calls
    if (!allowedFunctionSignatures.includes(funcSig)) {
        console.log("FUNC SIG did not match")
        throw new Error("Function Signature did not match expected function signatures")
    }

    let abiCoder = ethers.utils.defaultAbiCoder
    //TODO CHECK tHIS WORKS
    let encodedMeta = abiCoder.encode(["address", "bytes"], [metaProxyAddress, metaTransaction])
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

    return  signature


}
