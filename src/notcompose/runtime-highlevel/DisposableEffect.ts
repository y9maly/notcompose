import {currentComposer} from "../runtime/currentComposer.js";
import {remember} from "./remember.js";
import {RememberObserver} from "../runtime-plugins/rememberObserver/RememberObserver.js";


const Empty = Symbol()

export function DisposableEffect(
    keys: unknown[],
    block: () => (() => void) | void
): void

export function DisposableEffect(
    block: () => (() => void) | void
): void

export function DisposableEffect(
    a: unknown[] | (() => (() => void) | void),
    b: (() => (() => void) | void) | typeof Empty = Empty,
) {
    let keys: unknown[]
    let block: (() => (() => void) | void)

    if (b === Empty) {
        keys = []
        block = a as (() => (() => void) | void)
    } else {
        keys = a as unknown[]
        block = b as (() => (() => void) | void)
    }

    remember(keys, () => new DisposableEffectImpl(block))
}

class DisposableEffectImpl implements RememberObserver {
    [RememberObserver.symbol] = this

    private onDispose: (() => void) | void = undefined

    constructor(
        private block: () => (() => void) | void
    ) {}

    onRemembered(): void {
        currentComposer().exitComposition()
        this.onDispose = this.block()
        currentComposer().reenterComposition()
    }

    onForgotten(): void {
        currentComposer().exitComposition()
        if (this.onDispose) this.onDispose()
        currentComposer().reenterComposition()
    }
}
