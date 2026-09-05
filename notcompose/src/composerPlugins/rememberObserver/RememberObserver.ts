export interface RememberObserver {
    onRemembered(): void
    onForgotten(): void
}

const symbol = Symbol('RememberObserver')
RememberObserver.symbol = symbol
RememberObserver.is = (o: unknown): o is { [RememberObserver.symbol]: RememberObserver } =>
    !(!o || typeof o !== 'object' || !(RememberObserver.symbol in o))
RememberObserver.of = (o: unknown): RememberObserver | null =>
    RememberObserver.is(o) ? o[RememberObserver.symbol] : null

export function RememberObserver(
    onRemembered: () => void,
    onForgotten: () => void,
) {
    return new RememberObserverImpl(onRemembered, onForgotten)
}

class RememberObserverImpl implements RememberObserver {
    [RememberObserver.symbol] = this

    constructor(
        public onRemembered: () => void,
        public onForgotten: () => void,
    ) {}
}
