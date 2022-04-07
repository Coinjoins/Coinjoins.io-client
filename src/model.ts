export interface unspentUTXO {

    address: string
    coinbase: boolean,
    height: number,
    prevout_hash: string,
    prevout_n: number,
    value: string,
}

export interface apiUTXO {

    blockchain_transaction_index: number,
    blockchain_transaction_id: string
}

export interface cjStatus {
    signable: boolean,
    broadcasted: boolean,
    coinjoin: coinJoin
}

export interface address {

    address: string
}

export interface coinJoin {
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