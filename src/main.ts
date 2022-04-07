


import { isElectrumRunning } from "./setup"
import { checkCliArgs, createElectrumCommand } from "./setup"
import { getLatestUTXOset, getReceiveAddresses, signTransaction } from './electrum_commands'
import { createCoinJoinRequest, getCoinjoinSstatus, signCoinjoin } from "./server_commands";
import { coinJoin, cjStatus } from "./model";



const maxUTXOsSize = 5;



function delay(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

const checkSignable = async (cj: coinJoin, host: string): Promise<cjStatus> => {

    cj = await getCoinjoinSstatus(host, cj.request_id)


    if (cj.transaction.signable) {

        return {
            broadcasted: cj.transaction.broadcasted,
            signable: cj.transaction.signable,
            coinjoin: cj,
        }


    } else if (cj.transaction.abandoned) {

        throw new Error("coinjoin transaction abondoned")

    } else {

        console.log("coinjoin not yet signable")


        return {
            broadcasted: cj.transaction.broadcasted,
            signable: cj.transaction.signable,
            coinjoin: cj,
        }

    }
}


const checkBroadcasted = async (cj: coinJoin, host: string): Promise<cjStatus> => {

    cj = await getCoinjoinSstatus(host, cj.request_id)


    if (cj.transaction.broadcasted) {

        return {
            broadcasted: cj.transaction.broadcasted,
            signable: true,
            coinjoin: cj,
        }


    } else if (cj.transaction.abandoned) {

        throw new Error("coinjoin transaction abondoned")

    } else {

        console.log("coinjoin not yet signable")


        return {
            broadcasted: cj.transaction.broadcasted,
            signable: cj.transaction.signable,
            coinjoin: cj,
        }

    }
}

const mainLoop = async () => {

    try {

        console.info("starting coinjoin client. ")
        const isRunning = await isElectrumRunning()

        if (!isRunning) {
            console.error("Electron app is not running. Start the Electrum app with a bitcoin wallet to use the coinjoins.io client")
            process.exit(1);
        }


        const options = checkCliArgs()

        if (!options) {
            console.error("Incorrect command line options passed. Run with --help for more instructions")
            process.exit(1);
        }

        if (options.run_as_maker) {
            console.log("running coinjoins.io client as a liquidity provider")
        }

        const baseCmd = await createElectrumCommand(options)

        do {

            console.info("retrieving utxo set from wallet ")
            const utxos = await getLatestUTXOset(baseCmd, maxUTXOsSize);


            console.info("retrieving unused addresses from wallet")
            const addrs = await getReceiveAddresses(baseCmd, maxUTXOsSize)

            console.info("sending coinjoin request to server")
            const cj = await createCoinJoinRequest(options.host, addrs, utxos, options.run_as_maker)


            let status: cjStatus = null;

            for (; ;) {

                await delay(1000);

                console.info("asking server if the coinjoin is ready to be signed ...")
                status = await checkSignable(cj, options.host);

                if (status.signable) {
                    break;
                }

                console.info("the coinjoin  is not ready to be signed")

            }


            const signedTx = await signTransaction(baseCmd, status.coinjoin.transaction.hex)
            await signCoinjoin(options.host, status.coinjoin.request_id, signedTx)



            for (; ;) {
                await delay(300);

                const status = await checkBroadcasted(cj, options.host);

                if (status.broadcasted) {
                    console.log("transaction succesfully broadcasted")
                    break;
                }
            }

        } while (options.run_as_maker)


    } catch (err) {
        console.error(err)
    }


}

mainLoop();
