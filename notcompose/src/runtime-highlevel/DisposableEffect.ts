import { remember } from '../recomputation/remember.js'
import { RememberObserver } from '../composerPlugins/rememberObserver/RememberObserver.js'
import { outsideComposition } from '../composition/currentCompositionRun.js'

export function DisposableEffect(
    keys: unknown[],
    block: () => (() => void) | void
): void

export function DisposableEffect(
    block: () => (() => void) | void
): void

export function DisposableEffect(
    a: unknown[] | (() => (() => void) | void),
    b?: () => (() => void) | void,
) {
    let keys: unknown[]
    let block: (() => (() => void) | void)

    if (arguments.length === 2) {
        keys = a as unknown[]
        block = b!
    } else {
        keys = []
        block = a as (() => (() => void) | void)
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
        this.onDispose = outsideComposition(this.block)
    }

    onForgotten(): void {
        if (this.onDispose) {
            outsideComposition(this.onDispose)
        }
    }
}
