

import { spawn } from 'child_process';
import { resolvePtr } from 'dns';




export const runCommand = (command: string, password: string): Promise<string> => {

    return new Promise((resolve, reject) => {

        let cmdarray = command.split(" ");
        const proc = spawn(cmdarray.shift(), cmdarray);

        proc.stdout.on('data', (data) => {

            if (data.toString().includes("Password")) {
                proc.stdin.write(password);
            } else {
                resolve(data.toString());
            }
        });

        proc.stderr.on('data', (data) => {
            reject(data);
        });

        proc.on('close', (code) => {
            console.debug(`child process exited with code ${code}`);
        });
    })



}
