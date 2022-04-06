import util from 'util';
import child_process from "child_process";
const exec = util.promisify(child_process.exec);




export const command_list = {
    listunspent: "listunspent",
    createnewaddress: "createnewaddress",
    signtransaction: "signtransaction",

}

export const execCMDSync = async (command: string) => {

    const { stdout, stderr } = await exec(command);

    if (stderr.length > 0) {
        throw new Error(stderr)
    }

    return stdout;

}
