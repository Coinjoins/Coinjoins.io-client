
// find electrum path
// check if running as a maker or taker
// get unlist of unspent uxtos

//if taker run 1 cycle with last 5 unspent txos, and 5+1 addresses


import { execSync } from 'child_process'
import axios from 'axios'

const defaultElectronPath = "/System/Volumes/Data/Applications/Electrum.app/Contents/MacOS"
const path = "";
const walletPath = "";
const execCommand = path + " -w " + walletPath + " ";
const isMaker = false;
const host = "https://api.coinjoins.io/transaction"


const command_list = {
    listunspent: "listunspent",
    createnewaddress: "createnewaddress",
    signtransaction: "signtransaction",

}


interface unspentUTXO {

    address: string // "bc1qjhrtvdje7rkcd8grxu6dtpxg9ndvekkc6454vh",
    coinbase: boolean,
    height: number,
    prevout_hash: string,
    prevout_n: number,
    value: string,
}

interface coinJoin {
    "request_id": string,
    "ip_address": string,
    inputs: [
        {
            "blockchain_transaction_index": number,
            "blockchain_transaction_id": string
        }
    ],
    "outputs": [
        {
            "address": string
        }
    ],
    "transaction": {
        "id": string,
        "abandoned": true,
        "hex": string,
        "broadcasted": true,
        "inputs": [
            {
                "blockchain_transaction_index": number,
                "blockchain_transaction_id": string
            }
        ],
        "outputs": [
            {
                "address": string
            }
        ],
        "signable": true
    },
    "liquidity_provider": true,
    "liquidity_timeout": true
}



function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const getLatestUTXOset = (count: number) => {


    const utxos: Array<unspentUTXO> = JSON.parse(execSync(execCommand + command_list.listunspent).toString());

    return utxos.sort((a, b) => {
        return a.height - b.height
    }).slice(0, count);
}

const getReceiveAddresses = (count: number) => {

    const addresses = new Array<string>();

    for (let i = 0; i < count; i++) {
        addresses.push((execSync(execCommand + command_list.createnewaddress).toString()));
    }

    return addresses;
}

const createCoinjoin = async () => {

    const recent5Utxos = getLatestUTXOset(5).map((utxo) => {
        return {
            blockchain_transaction_index: utxo.prevout_n,
            blockchain_transaction_id: utxo.prevout_hash
        }
    });

    console.log("utxo set being privatized: ");
    console.log(JSON.stringify(recent5Utxos, null, 2))

    const newAddrs = getReceiveAddresses(5).map((addr) => {
        return {
            "address": addr,
        }
    })

    console.log("receive addresses for coinjoined bitcoin: ");
    console.log(JSON.stringify(newAddrs, null, 2))

    const postData = {
        "inputs": recent5Utxos,
        "outputs": newAddrs,
        "liquidity_provider": isMaker,
    }

    const response = await axios.post(host, postData)
    return response.data

}


const getCoinjoinSstatus = async (coinjoinID: string): Promise<coinJoin> => {

    const response = await axios.get(host, { params: { id: coinjoinID } })
    return response.data


}

const signCoinjoin = async (coinjoinID: string, tx: string) => {


    const signedTx = execSync(execCommand + command_list.signtransaction + "(" + tx + ")").toString();

    const postData = {
        id: coinjoinID,
        signed_transaction_hex: signedTx
    }

    const response = await axios.post(host, postData)
    return response.data;

}


const statusLoop = async (coinjoinID: string): Promise<string | boolean> => {

    const coinJoin: coinJoin = await getCoinjoinSstatus(coinjoinID)

    if (coinJoin.transaction.signable) {
        return coinJoin.transaction.hex;
    } else if (coinJoin.transaction.abandoned) {
        throw new Error("coinjoin transaction abondoned")
    } else if (coinJoin.transaction.broadcasted) {
        console.log("transaction broadcasted ")
        return null;
    } else {
        console.log("coinjoin not yet signable")
        await delay(300);
        return await statusLoop(coinjoinID)
    }
}



const mainLoop = async () => {


    for (; ;) {

        try {
            console.log("privatizing bitcoin with coinjoins.io ...")

            const coinJoin: coinJoin = await createCoinjoin()

            const id = coinJoin.request_id;

            const hex: string = await statusLoop(id) as string

            await signCoinjoin(id, hex)

            await statusLoop(id)

        } catch (e) {

            if (!isMaker) {
                process.exit(1)
            }

        }



    }


}
mainLoop()