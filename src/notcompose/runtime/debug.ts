export interface DebugConsole {
    log(...data: unknown[]): void
}

export let debug: DebugConsole = {
    log() {},
}

export function setDebugConsole(value: DebugConsole) {
    debug = value
}
