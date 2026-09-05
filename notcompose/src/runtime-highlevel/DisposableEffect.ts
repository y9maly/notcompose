import { currentComposer } from '../composer/currentComposer.js'
import { remember } from '../recomputation/remember.js'
import { RememberObserver } from '../composerPlugins/rememberObserver/RememberObserver.js'

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
        currentComposer().exitComposition()
        try {
            this.onDispose = this.block()
        } finally {
            currentComposer().reenterComposition()
        }
    }

    onForgotten(): void {
        if (this.onDispose) {
            currentComposer().exitComposition()
            try {
                this.onDispose()
            } finally {
                currentComposer().reenterComposition()
            }
        }
    }
}
