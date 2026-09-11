import { remember } from '../recomputation/remember.js'
import { RememberObserver } from '../composerPlugins/rememberObserver/RememberObserver.js'
import { outsideComposition } from '../composition/currentCompositionRun.js'
import { RecomputeScopeHolder } from '../recomputation/RecomputeScopeHolder.js'

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

    // todo need lower-level recompute-scope API here!
    const holder = remember(() => {
        const holder = new RecomputeScopeHolder();
        (holder as any)[RememberObserver.symbol] = RememberObserver(() => {}, () => holder.dispose())
        return holder
    })
    remember(keys, () => new DisposableEffectImpl(holder, block))
}

class DisposableEffectImpl implements RememberObserver {
    [RememberObserver.symbol] = this

    private onDispose: (() => void) | void = undefined

    constructor(
        private readonly recomputeScopeHolder: RecomputeScopeHolder,
        private block: () => (() => void) | void
    ) {}

    onRemembered(): void {
        this.onDispose = outsideComposition(() => this.recomputeScopeHolder.withRecomputeScope(this.block))
    }

    onForgotten(): void {
        if (this.onDispose) {
            outsideComposition(this.onDispose)
        }
    }
}
