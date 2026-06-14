import {InputSource} from "./InputSource.js";
import * as readline from "node:readline";
import process from "node:process";

export class StdinInputSource implements InputSource {
    start(listener: (string: string, key: any) => void): Disposable {
        const oldIsRaw = process.stdin.isRaw

        readline.emitKeypressEvents(process.stdin)
        if (process.stdin.isTTY)
            process.stdin.setRawMode(true)

        process.stdin.on('keypress', listener)

        return {
            [Symbol.dispose]() {
                if (process.stdin.isTTY) {
                    process.stdin.setRawMode(oldIsRaw)
                }

                process.stdin.off('keypress', listener)
            }
        }
    }
}
