/*
import os from 'os';
import * as readline from 'readline';
import { execSync } from 'child_process'
import axios from 'axios'
import { runCommand } from './run_command'


const rl = readline.createInterface({
    input: process.stdin, //or fileStream
    output: process.stdout
});

const defaultElectronPath = "/System/Volumes/Data/Applications/Electrum.app/Contents/MacOS/run_electrum"
const defaultWalletPath = os.homedir() + '/.electrum/wallets/default_wallet'
const isMaker = false;
const host = "https://api.coinjoins.io"


let execCommand = "";

const paths = {
    createTransaction: host + "/transaction",
    getTransaction: host + "/transaction",
    signTransaction: host + "/transaction/sign"

}

const command_list = {
    listunspent: "listunspent",
    createnewaddress: "createnewaddress",
    signtransaction: "signtransaction",

}


interface unspentUTXO {

    address: string
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


function checkElectrumRunning() {

}

function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const question = (text: string): Promise<string> => {
    return new Promise((resolve, reject) => {

        rl.question(text, resolve)

    })
}


const setConfiguration = async () => {



    let electronPath: string = await question(`Enter electron path ( press enter for default : ${defaultElectronPath} )  `);

    if (electronPath === "") {
        electronPath = defaultElectronPath;
    }
    let walletPath: string = await question(`Enter electrum bitcoin wallet path (press enter for default: ${defaultWalletPath} )  `);

    if (walletPath === "") {
        walletPath = defaultWalletPath;
    }

    execCommand = electronPath + " -w " + walletPath + " ";
    console.log(execCommand);
}



const getLatestUTXOset = async (count: number) => {


    let output = await runCommand(execCommand + command_list.listunspent);
    console.log(output)
    const utxos: Array<unspentUTXO> = JSON.parse(output);
    console.log(utxos)

    console.log("got utxos")

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

    console.log("creating coinjoin..")
    const recent5Utxos = (await getLatestUTXOset(5)).map((utxo) => {
        console.log(utxo.prevout_n)
        return {
            blockchain_transaction_index: utxo.prevout_n,
            blockchain_transaction_id: utxo.prevout_hash
        }
    });

    console.log("utxo set being privatized: ");
    console.log(JSON.stringify(recent5Utxos, null, 2))

    const newAddrs = getReceiveAddresses(6).map((addr) => {
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

    console.log(postData);

    const response = await axios.post(paths.createTransaction, postData)
    return response.data

}


const getCoinjoinSstatus = async (coinjoinID: string): Promise<coinJoin> => {

    const response = await axios.get(paths.getTransaction, { params: { id: coinjoinID } })
    return response.data


}

const signCoinjoin = async (coinjoinID: string, tx: string) => {


    const signedTx = execSync(execCommand + command_list.signtransaction + "(" + tx + ")").toString();

    const postData = {
        id: coinjoinID,
        signed_transaction_hex: signedTx
    }

    const response = await axios.post(paths.signTransaction, postData)
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

            await setConfiguration();

            console.log("creating a coinjoin");
            const coinJoin: coinJoin = await createCoinjoin()

            const id = coinJoin.request_id;

            const hex: string = await statusLoop(id) as string

            await signCoinjoin(id, hex)

            await statusLoop(id)

        } catch (e) {
            console.log(e);
            if (!isMaker) {
                process.exit(1)
            }

        }



    }


}
mainLoop()
*/ 
//# sourceMappingURL=coinjoins.io.client.js.map