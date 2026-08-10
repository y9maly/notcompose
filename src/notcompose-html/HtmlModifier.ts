import { createExtendedModifier, Modifier as BaseModifier, ModifierElement } from 'notcompose'
import { AttributeValue } from './runtime/attributes/attributes.js'
import { AttributeModifier } from './runtime/modifiers/AttributeModifier.js'
import { StyleModifier, StyleValue } from './runtime/modifiers/StyleModifier.js'
import { DomEvent, ListenerModifier } from './runtime/modifiers/ListenerModifier.js'
import { PropertyModifier } from './runtime/modifiers/PropertyModifier.js'
import { DomRef, RefModifier } from './runtime/modifiers/RefModifier.js'

class HtmlModifier {
    constructor(
        public readonly elements: ReadonlyArray<ModifierElement> = []
    ) {}

    attr(name: string, value: AttributeValue): this {
        return this.append(new AttributeModifier(name, value))
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
    name_(value: string): this { return this.attr('name', value) }
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
    data(name: string, value: AttributeValue): this { return this.attr(`data-${name}`, value) }
    aria(name: string, value: AttributeValue): this { return this.attr(`aria-${name}`, value) }
    classes(...values: (string | null | undefined | false)[]): this { return this.attr('class', values.filter((it): it is string => typeof it === 'string' && it.length > 0).join(' ')) }
    className(value: string): this { return this.attr('class', value) }

    style(declarations: Readonly<Record<string, StyleValue>>): this
    style(name: string, value: StyleValue): this
    style(nameOrDeclarations: string | Readonly<Record<string, StyleValue>>, value?: StyleValue): this {
        if (typeof nameOrDeclarations === 'string')
            return this.append(new StyleModifier(nameOrDeclarations, value))

        return this.append(
            ...Object.entries(nameOrDeclarations)
                .map(([name, declarationValue]) => new StyleModifier(name, declarationValue))
        )
    }

    prop(name: PropertyKey, value: unknown): this {
        return this.append(new PropertyModifier(element => {
            Reflect.set(element, name, value)
        }))
    }

    property<ELEMENT extends Element = Element>(update: (element: ELEMENT) => void): this {
        return this.append(new PropertyModifier(element => update(element as ELEMENT)))
    }

    on<ELEMENT extends Element = Element, EVENT extends Event = Event>(
        type: string,
        listener: (event: DomEvent<ELEMENT, EVENT>) => void,
        options?: boolean | AddEventListenerOptions,
    ): this {
        return this.append(new ListenerModifier(type, listener, options))
    }

    onClick<ELEMENT extends Element = HTMLElement>(listener: (event: DomEvent<ELEMENT, MouseEvent>) => void): this {
        return this.on('click', listener)
    }

    onDoubleClick<ELEMENT extends Element = HTMLElement>(listener: (event: DomEvent<ELEMENT, MouseEvent>) => void): this {
        return this.on('dblclick', listener)
    }

    onInput<ELEMENT extends Element = HTMLInputElement>(listener: (event: DomEvent<ELEMENT, InputEvent>) => void): this {
        return this.on('input', listener)
    }

    onChange<ELEMENT extends Element = HTMLInputElement>(listener: (event: DomEvent<ELEMENT>) => void): this {
        return this.on('change', listener)
    }

    onSubmit<ELEMENT extends Element = HTMLFormElement>(listener: (event: DomEvent<ELEMENT, SubmitEvent>) => void): this {
        return this.on('submit', listener)
    }

    onKeyDown<ELEMENT extends Element = HTMLElement>(listener: (event: DomEvent<ELEMENT, KeyboardEvent>) => void): this {
        return this.on('keydown', listener)
    }

    onKeyUp<ELEMENT extends Element = HTMLElement>(listener: (event: DomEvent<ELEMENT, KeyboardEvent>) => void): this {
        return this.on('keyup', listener)
    }

    onFocus<ELEMENT extends Element = HTMLElement>(listener: (event: DomEvent<ELEMENT, FocusEvent>) => void): this {
        return this.on('focus', listener)
    }

    onBlur<ELEMENT extends Element = HTMLElement>(listener: (event: DomEvent<ELEMENT, FocusEvent>) => void): this {
        return this.on('blur', listener)
    }

    ref<ELEMENT extends Element = HTMLElement>(effect: DomRef<ELEMENT>): this {
        return this.append(new RefModifier(effect))
    }

    private append(...elements: ReadonlyArray<ModifierElement>): this {
        return Modifier.then(...this.elements, ...elements) as unknown as this
    }
}

export type Modifier = BaseModifier
export const Modifier = createExtendedModifier(HtmlModifier)
