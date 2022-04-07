

export const command_list = {
    listunspent: "listunspent",
    createnewaddress: "createnewaddress",
    signtransaction: "signtransaction",

}


import { execCMDSync } from './run_command'
import { unspentUTXO, address } from './model'


export const getLatestUTXOset = async (baseCMD: string, count: number) => {


    const output = await execCMDSync(baseCMD + command_list.listunspent);
    const utxos: Array<unspentUTXO> = JSON.parse(output);

    const newUtxos = utxos.sort((a, b) => {
        return a.height - b.height
    }).map((utxo) => {
        return {
            blockchain_transaction_index: utxo.prevout_n,
            blockchain_transaction_id: utxo.prevout_hash
        }
    })
    return newUtxos.slice(0, count);
}


export const getReceiveAddresses = async (baseCMD: string, count: number) => {

    const addresses = new Array<address>();

    for (let i = 0; i < count; i++) {
        const addrStrOutput = await execCMDSync(baseCMD + command_list.createnewaddress);
        addresses.push({
            address: addrStrOutput.toString()
        });
    }

    return addresses;
}


export const signTransaction = async (baseCMD: string, tx: string) => {


    const signedTx = await execCMDSync(baseCMD + command_list.signtransaction + "(" + tx + ")").toString();

    return signedTx;
}