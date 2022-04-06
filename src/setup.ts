
import { readFileSync } from 'fs';
import { execCMDSync } from './run_command'
import { program } from 'commander'


const configPath = "./config.json"
export const checkCliArgs = () => {

    program
        .requiredOption('--host , <string>')
        .requiredOption('--default_wallet_path , <string>')
        .requiredOption('--default_electrum_path_macos, <string>')
        .option('--run_as_maker');

    try {
        program.parse();
        const options = program.opts();
        return {
            "host": options.host,
            "default_wallet_path": options.default_wallet_path,
            "default_electrum_path_macos": options.default_electrum_path_macos,
            "run_as_maker": options.run_as_maker || false
        }
    } catch (err) {
        return null;
    }


}


export const getConfigFileArgs = () => {
    JSON.parse(readFileSync(configPath).toString());
}


export const isElectrumRunning = async () => {

    const isElectrumRunningCmd = "ps aux | grep electrum"

    const electrumAppName = "run_electrum"

    const output = await execCMDSync(isElectrumRunningCmd)

    return output.includes(electrumAppName)

}

export const createElectrumCommand = async (cliArgs: any) => {

    return cliArgs.default_electrum_path_macos + " -w " + cliArgs.default_wallet_path + " ";
}
