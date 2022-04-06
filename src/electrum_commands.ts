

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

    return utxos.sort((a, b) => {
        return a.height - b.height
    }).slice(0, count);
}


export const getReceiveAddresses = (baseCMD: string, count: number) => {

    const addresses = new Array<address>();

    for (let i = 0; i < count; i++) {
        addresses.push(JSON.parse(execCMDSync(baseCMD + command_list.createnewaddress).toString()));
    }

    return addresses;
}


export const signTransaction = (baseCMD: string, tx: string) => {


    const signedTx = execCMDSync(baseCMD + command_list.signtransaction + "(" + tx + ")").toString();

    return signedTx;
}