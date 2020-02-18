const {dappSigner} = require('./service')

exports.handler = async (ev) => {
    
    if (ev.httpMethod === 'GET') {
        return fail("POST instead")
    } else if (ev.httpMethod === 'POST') {
        const body = JSON.parse(ev.body)
        const { metaTx } = body;
        try {
            let signature = await dappSigner(metaTx);
            return success({signature})
        } catch (err) {
            return fail(err.message)
        }
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