import * as readline from "node:readline";
import {InputDispatcher} from "./InputDispatcher";
import process from "node:process";


export class InputProcessor {
    constructor(
        private dispatcher: InputDispatcher
    ) {}

    private listener?: ((string: string, key: unknown) => boolean)

    start() {
        readline.emitKeypressEvents(process.stdin)
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(true)
        }

        this.listener = (string, key) => {
            return this.dispatcher.dispatch(string, key)
        }

        process.stdin.on('keypress', this.listener);
    }

    stop() {
        if (this.listener === undefined)
            return
        process.stdin.off('keypress', this.listener)
    }
}
