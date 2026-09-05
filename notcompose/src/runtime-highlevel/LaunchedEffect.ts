import { remember } from '../recomputation/remember.js'
import { RememberObserver } from '../composerPlugins/rememberObserver/RememberObserver.js'
import { outsideComposition } from '../composition/currentCompositionRun.js'

export function LaunchedEffect(
    keys: unknown[],
    block: () => void
): void

export function LaunchedEffect(
    block: () => void
): void

export function LaunchedEffect(
    a: unknown[] | (() => void),
    b?: () => void,
) {
    let keys: unknown[]
    let block: () => void

    if (arguments.length === 2) {
        keys = a as unknown[]
        block = b! satisfies () => void
    } else {
        keys = []
        block = a as () => void
    }

    remember(keys, () => new LaunchedEffectImpl(block))
}

class LaunchedEffectImpl implements RememberObserver {
    [RememberObserver.symbol] = this

    constructor(
        private block: () => void
    ) {}

    onRemembered(): void {
        outsideComposition(this.block)
    }

    onForgotten(): void {}
}
