import {remember} from "./remember.js";
import {RememberObserver} from "../runtime-plugins/rememberObserver/RememberObserver.js";
import {currentComposer} from "../runtime/currentComposer";


const Empty = Symbol()

export function LaunchedEffect(
    keys: unknown[],
    block: () => void
): void

export function LaunchedEffect(
    block: () => void
): void

export function LaunchedEffect(
    a: unknown[] | (() => void),
    b: (() => void) | typeof Empty = Empty,
) {
    let keys: unknown[]
    let block: () => void

    if (b === Empty) {
        keys = []
        block = a as () => void
    } else {
        keys = a as unknown[]
        block = b as () => void
    }

    remember(keys, () => new LaunchedEffectImpl(block))
}

class LaunchedEffectImpl implements RememberObserver {
    [RememberObserver.symbol] = this

    constructor(
        private block: () => void
    ) {}

    onRemembered(): void {
        currentComposer().exitComposition()
        this.block()
        currentComposer().reenterComposition()
    }

    onForgotten(): void {}
}
