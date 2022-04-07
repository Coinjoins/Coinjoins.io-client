import { address, unspentUTXO, coinJoin, apiUTXO } from "./model";
import axios from 'axios'

const paths = {
    createTransaction: "/transaction",
    getTransaction: "/transaction",
    signTransaction: "/transaction/sign"

}

export const createCoinJoinRequest = async (host: string, newAddrs: address[], recentUtxos: apiUTXO[], isMaker: boolean): Promise<coinJoin> => {


    const postData = {
        "inputs": recentUtxos,
        "outputs": newAddrs,
        "liquidity_provider": isMaker,
    }

    console.log(postData);

    const response = await axios.post(host + paths.createTransaction, postData)
    return response.data

}


export const getCoinjoinSstatus = async (host: string, coinjoinID: string): Promise<coinJoin> => {

    const response = await axios.get(host + paths.getTransaction, { params: { id: coinjoinID } })
    return response.data


}

export const signCoinjoin = async (host: string, coinjoinID: string, signedTx: string) => {




    const postData = {
        id: coinjoinID,
        signed_transaction_hex: signedTx
    }

    const response = await axios.post(host + paths.signTransaction, postData)
    return response.data;

}