import { remember } from '../recomputation/remember.js'
import { RememberObserver } from '../composerPlugins/rememberObserver/RememberObserver.js'
import { outsideComposition } from '../composition/currentCompositionRun.js'
import { RecomputeScopeHolder } from '../recomputation/RecomputeScopeHolder.js'

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

    // todo need lower-level recompute-scope API here!
    const holder = remember(() => {
        const holder = new RecomputeScopeHolder();
        (holder as any)[RememberObserver.symbol] = RememberObserver(() => {}, () => holder.dispose())
        return holder
    })
    remember(keys, () => new LaunchedEffectImpl(holder, block))
}

class LaunchedEffectImpl implements RememberObserver {
    [RememberObserver.symbol] = this

    constructor(
        private recomputeScopeHolder: RecomputeScopeHolder,
        private block: () => void
    ) {}

    onRemembered(): void {
        outsideComposition(() => this.recomputeScopeHolder.withRecomputeScope(this.block))
    }

    onForgotten(): void {}
}
