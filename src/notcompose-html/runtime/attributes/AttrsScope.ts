export type AttributeValue = string | number | boolean | null | undefined
export type StyleValue = string | number | null | undefined

export type DomEvent<ELEMENT extends Element, EVENT extends Event = Event> = EVENT & {
    readonly currentTarget: ELEMENT
}

export interface DomEventListener {
    readonly type: string
    readonly listener: EventListener
    readonly options?: boolean | AddEventListenerOptions
}

export interface DomAttributesSnapshot {
    readonly attributes: ReadonlyMap<string, string>
    readonly styles: ReadonlyMap<string, string>
    readonly listeners: ReadonlyMap<string, DomEventListener>
    readonly propertyUpdates: ReadonlyArray<(element: Element) => void>
    readonly ref: DomRef<Element> | null
}

export interface DomRef<ELEMENT extends Element> {
    (element: ELEMENT): void | (() => void)
}

export class AttrsScope<ELEMENT extends Element> {
    private readonly attributes = new Map<string, string>()
    private readonly styles = new Map<string, string>()
    private readonly listeners = new Map<string, DomEventListener>()
    private readonly propertyUpdates: ((element: Element) => void)[] = []
    private refEffect: DomRef<Element> | null = null

    attr(name: string, value: AttributeValue): this {
        if (value === null || value === undefined || value === false) {
            this.attributes.delete(name)
        } else {
            this.attributes.set(name, value === true ? '' : String(value))
        }
        return this
    }

    id(value: string): this { return this.attr('id', value) }
    title(value: string): this { return this.attr('title', value) }
    role(value: string): this { return this.attr('role', value) }
    lang(value: string): this { return this.attr('lang', value) }
    dir(value: 'ltr' | 'rtl' | 'auto'): this { return this.attr('dir', value) }
    tabIndex(value: number): this { return this.attr('tabindex', value) }
    hidden(value: boolean = true): this { return this.attr('hidden', value) }
    disabled(value: boolean = true): this { return this.attr('disabled', value) }
    draggable(value: boolean): this { return this.attr('draggable', value) }

    href(value: string): this { return this.attr('href', value) }
    src(value: string): this { return this.attr('src', value) }
    alt(value: string): this { return this.attr('alt', value) }
    name(value: string): this { return this.attr('name', value) }
    type(value: string): this { return this.attr('type', value) }
    value(value: string | number): this { return this.attr('value', value) }
    placeholder(value: string): this { return this.attr('placeholder', value) }
    checked(value: boolean = true): this { return this.attr('checked', value) }
    selected(value: boolean = true): this { return this.attr('selected', value) }
    multiple(value: boolean = true): this { return this.attr('multiple', value) }
    required(value: boolean = true): this { return this.attr('required', value) }
    readOnly(value: boolean = true): this { return this.attr('readonly', value) }
    min(value: string | number): this { return this.attr('min', value) }
    max(value: string | number): this { return this.attr('max', value) }
    step(value: string | number): this { return this.attr('step', value) }
    width(value: string | number): this { return this.attr('width', value) }
    height(value: string | number): this { return this.attr('height', value) }
    target(value: string): this { return this.attr('target', value) }
    rel(value: string): this { return this.attr('rel', value) }
    action(value: string): this { return this.attr('action', value) }
    method(value: string): this { return this.attr('method', value) }
    htmlFor(value: string): this { return this.attr('for', value) }

    data(name: string, value: AttributeValue): this {
        return this.attr(`data-${name}`, value)
    }

    aria(name: string, value: AttributeValue): this {
        return this.attr(`aria-${name}`, value)
    }

    classes(...values: (string | null | undefined | false)[]): this {
        return this.attr('class', values.filter((it): it is string => typeof it === 'string' && it.length > 0).join(' '))
    }

    className(value: string): this {
        return this.attr('class', value)
    }

    style(declarations: Readonly<Record<string, StyleValue>>): this
    style(name: string, value: StyleValue): this
    style(nameOrDeclarations: string | Readonly<Record<string, StyleValue>>, value?: StyleValue): this {
        if (typeof nameOrDeclarations === 'string') {
            this.setStyle(nameOrDeclarations, value)
        } else {
            Object.entries(nameOrDeclarations).forEach(([name, declarationValue]) => {
                this.setStyle(name, declarationValue)
            })
        }
        return this
    }

    prop<KEY extends keyof ELEMENT>(name: KEY, value: ELEMENT[KEY]): this {
        this.propertyUpdates.push(element => {
            (element as ELEMENT)[name] = value
        })
        return this
    }

    property(update: (element: ELEMENT) => void): this {
        this.propertyUpdates.push(element => update(element as ELEMENT))
        return this
    }

    on<EVENT extends Event = Event>(
        type: string,
        listener: (event: DomEvent<ELEMENT, EVENT>) => void,
        options?: boolean | AddEventListenerOptions,
    ): this {
        const capture = typeof options === 'boolean' ? options : options?.capture ?? false
        this.listeners.set(`${type}:${capture}`, {
            type,
            listener: listener as EventListener,
            options,
        })
        return this
    }

    onClick(listener: (event: DomEvent<ELEMENT, MouseEvent>) => void): this { return this.on('click', listener) }
    onDoubleClick(listener: (event: DomEvent<ELEMENT, MouseEvent>) => void): this { return this.on('dblclick', listener) }
    onInput(listener: (event: DomEvent<ELEMENT, InputEvent>) => void): this { return this.on('input', listener) }
    onChange(listener: (event: DomEvent<ELEMENT>) => void): this { return this.on('change', listener) }
    onSubmit(listener: (event: DomEvent<ELEMENT, SubmitEvent>) => void): this { return this.on('submit', listener) }
    onKeyDown(listener: (event: DomEvent<ELEMENT, KeyboardEvent>) => void): this { return this.on('keydown', listener) }
    onKeyUp(listener: (event: DomEvent<ELEMENT, KeyboardEvent>) => void): this { return this.on('keyup', listener) }
    onFocus(listener: (event: DomEvent<ELEMENT, FocusEvent>) => void): this { return this.on('focus', listener) }
    onBlur(listener: (event: DomEvent<ELEMENT, FocusEvent>) => void): this { return this.on('blur', listener) }

    ref(effect: DomRef<ELEMENT>): this {
        this.refEffect = effect as DomRef<Element>
        return this
    }

    build(): DomAttributesSnapshot {
        return {
            attributes: this.attributes,
            styles: this.styles,
            listeners: this.listeners,
            propertyUpdates: this.propertyUpdates,
            ref: this.refEffect,
        }
    }

    private setStyle(name: string, value: StyleValue) {
        const propertyName = cssPropertyName(name)
        if (value === null || value === undefined) {
            this.styles.delete(propertyName)
        } else {
            this.styles.set(propertyName, String(value))
        }
    }
}

function cssPropertyName(name: string): string {
    if (name.startsWith('--') || name.includes('-'))
        return name
    return name.replace(/[A-Z]/g, match => `-${match.toLowerCase()}`)
}

export function emptyDomAttributes(): DomAttributesSnapshot {
    return {
        attributes: new Map(),
        styles: new Map(),
        listeners: new Map(),
        propertyUpdates: [],
        ref: null,
    }
}
