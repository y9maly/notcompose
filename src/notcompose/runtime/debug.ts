import {Writable} from "node:stream";
import * as console from "node:console";


export let debug: console.Console = new console.Console({
    stdout: new Writable(),
    stderr: new Writable(),
})

export function setDebugConsole(value: console.Console) {
    debug = value
}
