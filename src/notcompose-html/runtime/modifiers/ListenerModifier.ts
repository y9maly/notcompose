import { ModifierElement } from 'notcompose'

export type DomEvent<ELEMENT extends Element, EVENT extends Event = Event> = EVENT & {
    readonly currentTarget: ELEMENT
}

export class ListenerModifier<
    ELEMENT extends Element = Element,
    EVENT extends Event = Event,
> implements ModifierElement {
    public readonly listener: EventListener

    constructor(
        public readonly type: string,
        listener: (event: DomEvent<ELEMENT, EVENT>) => void,
        public readonly options?: boolean | AddEventListenerOptions,
    ) {
        this.listener = listener as EventListener
    }

    equals(other: ModifierElement): boolean {
        return other instanceof ListenerModifier
            && other.type === this.type
            && other.listener === this.listener
            && other.options === this.options
    }
}
