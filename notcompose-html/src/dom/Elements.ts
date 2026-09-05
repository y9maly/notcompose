import { TagElement } from './TagElement.js'
import { Modifier } from '../HtmlModifier.js'
import { Text } from './Text.js'
import type { StyleValue } from '../runtime/modifiers/StyleModifier.js'

/*

Тут ещё предстоит навести порядок

 */

type ElementOf<TAG extends keyof HTMLElementTagNameMap> = HTMLElementTagNameMap[TAG]
type SpecificKeys<ELEMENT extends Element> = Exclude<keyof ELEMENT, keyof HTMLElement>
type ElementOptions<ELEMENT extends Element> = {
    [KEY in SpecificKeys<ELEMENT> as KEY extends string ? KEY : never]?: ELEMENT[KEY]
}

type OptionsOf<TAG extends keyof HTMLElementTagNameMap> = ElementOptions<ElementOf<TAG>>
type ModifierOptions<OPTIONS> = Omit<OPTIONS, 'modifier'> & { modifier?: Modifier }
type ModifierOptionsOf<TAG extends keyof HTMLElementTagNameMap> = ModifierOptions<OptionsOf<TAG>>

function parseModifierOrOptions<OPTIONS extends object>(
    modifierOrOptions?: Modifier | ModifierOptions<OPTIONS>,
    options?: OPTIONS
): [Modifier, OPTIONS | undefined] {
    // todo use arguemnts.length

    if (options !== undefined)
        return [modifierOrOptions as Modifier, options]
    if (modifierOrOptions === undefined)
        return [Modifier, undefined]
    if (modifierOrOptions instanceof Modifier)
        return [modifierOrOptions as Modifier, undefined]
    if (!('modifier' in modifierOrOptions)) {
        return [Modifier, modifierOrOptions as OPTIONS]
    }
    const modifier = modifierOrOptions.modifier ?? Modifier
    const optionsWithoutModifier = { ...modifierOrOptions }
    delete optionsWithoutModifier.modifier
    return [modifier, optionsWithoutModifier as OPTIONS]
}

// Document metadata

export function Html(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'html'>): void
export function Html(content: string | (() => void), options?: OptionsOf<'html'>): void
export function Html(...args: contentElement<'html'>): void { contentElement('html', args) }

export function Head(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'head'>): void
export function Head(content: string | (() => void), options?: OptionsOf<'head'>): void
export function Head(...args: contentElement<'head'>): void { contentElement('head', args) }

export function Body(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'body'>): void
export function Body(content: string | (() => void), options?: OptionsOf<'body'>): void
export function Body(...args: contentElement<'body'>): void { contentElement('body', args) }

export function Title(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'title'>): void
export function Title(content: string | (() => void), options?: OptionsOf<'title'>): void
export function Title(...args: contentElement<'title'>): void { contentElement('title', args) }

export function Meta(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'meta'>): void
export function Meta(content: string | (() => void), options?: OptionsOf<'meta'>): void
export function Meta(...args: contentElement<'meta'>): void { contentElement('meta', args) }

export function Link(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'link'>): void
export function Link(content: string | (() => void), options?: OptionsOf<'link'>): void
export function Link(...args: contentElement<'link'>): void { contentElement('link', args) }

export function Style(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'style'>): void
export function Style(content: string | (() => void), options?: OptionsOf<'style'>): void
export function Style(...args: contentElement<'style'>): void { contentElement('style', args) }

// Page structure

export function Address(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'address'>): void
export function Address(content: string | (() => void), options?: OptionsOf<'address'>): void
export function Address(...args: contentElement<'address'>): void { contentElement('address', args) }

export function Article(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'article'>): void
export function Article(content: string | (() => void), options?: OptionsOf<'article'>): void
export function Article(...args: contentElement<'article'>): void { contentElement('article', args) }

export function Aside(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'aside'>): void
export function Aside(content: string | (() => void), options?: OptionsOf<'aside'>): void
export function Aside(...args: contentElement<'aside'>): void { contentElement('aside', args) }

export function Header(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'header'>): void
export function Header(content: string | (() => void), options?: OptionsOf<'header'>): void
export function Header(...args: contentElement<'header'>): void { contentElement('header', args) }

export function Footer(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'footer'>): void
export function Footer(content: string | (() => void), options?: OptionsOf<'footer'>): void
export function Footer(...args: contentElement<'footer'>): void { contentElement('footer', args) }

export function Main(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'main'>): void
export function Main(content: string | (() => void), options?: OptionsOf<'main'>): void
export function Main(...args: contentElement<'main'>): void { contentElement('main', args) }

export function Nav(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'nav'>): void
export function Nav(content: string | (() => void), options?: OptionsOf<'nav'>): void
export function Nav(...args: contentElement<'nav'>): void { contentElement('nav', args) }

export function Section(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'section'>): void
export function Section(content: string | (() => void), options?: OptionsOf<'section'>): void
export function Section(...args: contentElement<'section'>): void { contentElement('section', args) }

export function Div(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'span'> & { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }): void
export function Div(content: string | (() => void), options?: ModifierOptionsOf<'span'> & { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }): void
export function Div(modifier?: Modifier, options?: OptionsOf<'span'> & { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }): void
export function Div(options?: OptionsOf<'span'> & { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }): void
export function Div(...args: voidOrContentElement<'div', { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }>) {
    if (args.at(0) instanceof Modifier || typeof args.at(0) === 'object')
        return voidElement('div', args as voidElement<'div', { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }>, {
            optionsToDelete: ['style'],
            interceptModifier: (initialModifier, options) => {
                let modifier = Modifier(initialModifier)
                if (options?.style)
                    modifier = modifier.style(options.style)
                return modifier
            }
        })
    contentElement('div', args as contentElement<'div', { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }>, {
        optionsToDelete: ['style'],
        interceptModifier: (initialModifier, options) => {
            let modifier = Modifier(initialModifier)
            if (options?.style)
                modifier = modifier.style(options.style)
            return modifier
        }
    })
}

export function Span(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'span'> & { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }): void
export function Span(content: string | (() => void), options?: ModifierOptionsOf<'span'> & { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }): void
export function Span(modifier?: Modifier, options?: ModifierOptionsOf<'span'> & { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }): void
export function Span(options?: ModifierOptionsOf<'span'> & { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }): void
export function Span(...args: voidOrContentElement<'span', { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }>) {
    if (args.at(0) instanceof Modifier || typeof args.at(0) === 'object')
        return voidElement('span', args as voidElement<'span', { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }>, {
            optionsToDelete: ['style'],
            interceptModifier: (initialModifier, options) => {
                let modifier = Modifier(initialModifier)
                if (options?.style)
                    modifier = modifier.style(options.style)
                return modifier
            }
        })
    contentElement('span', args as contentElement<'span', { style?: CSSStyleDeclaration | Readonly<Record<string, StyleValue>> }>, {
        optionsToDelete: ['style'],
        interceptModifier: (initialModifier, options) => {
            let modifier = Modifier(initialModifier)
            if (options?.style)
                modifier = modifier.style(options.style)
            return modifier
        }
    })
}

// Text content

export function H1(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'h1'>): void
export function H1(content: string | (() => void), options?: ModifierOptionsOf<'h1'>): void
export function H1(...args: contentElement<'h1'>) { contentElement('h1', args) }

export function H2(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'h2'>): void
export function H2(content: string | (() => void), options?: ModifierOptionsOf<'h2'>): void
export function H2(...args: contentElement<'h2'>) { contentElement('h2', args) }

export function H3(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'h3'>): void
export function H3(content: string | (() => void), options?: ModifierOptionsOf<'h3'>): void
export function H3(...args: contentElement<'h3'>) { contentElement('h3', args) }

export function H4(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'h4'>): void
export function H4(content: string | (() => void), options?: ModifierOptionsOf<'h4'>): void
export function H4(...args: contentElement<'h4'>) { contentElement('h4', args) }

export function H5(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'h5'>): void
export function H5(content: string | (() => void), options?: ModifierOptionsOf<'h5'>): void
export function H5(...args: contentElement<'h5'>) { contentElement('h5', args) }

export function H6(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'h6'>): void
export function H6(content: string | (() => void), options?: ModifierOptionsOf<'h6'>): void
export function H6(...args: contentElement<'h6'>) { contentElement('h6', args) }

export function P(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'p'>): void
export function P(content: string | (() => void), options?: ModifierOptionsOf<'p'>): void
export function P(...args: contentElement<'p'>) { contentElement('p', args) }

export function A(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'a'>): void
export function A(content: string | (() => void), options?: ModifierOptionsOf<'a'>): void
export function A(...args: contentElement<'a'>) { contentElement('a', args) }

export function B(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'b'>): void
export function B(content: string | (() => void), options?: ModifierOptionsOf<'b'>): void
export function B(...args: contentElement<'b'>) { contentElement('b', args) }

export function Strong(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'strong'>): void
export function Strong(content: string | (() => void), options?: ModifierOptionsOf<'strong'>): void
export function Strong(...args: contentElement<'strong'>) { contentElement('strong', args) }

export function I(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'i'>): void
export function I(content: string | (() => void), options?: ModifierOptionsOf<'i'>): void
export function I(...args: contentElement<'i'>) { contentElement('i', args) }

export function Em(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'em'>): void
export function Em(content: string | (() => void), options?: ModifierOptionsOf<'em'>): void
export function Em(...args: contentElement<'em'>) { contentElement('em', args) }

export function Small(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'small'>): void
export function Small(content: string | (() => void), options?: ModifierOptionsOf<'small'>): void
export function Small(...args: contentElement<'small'>) { contentElement('small', args) }

export function Mark(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'mark'>): void
export function Mark(content: string | (() => void), options?: ModifierOptionsOf<'mark'>): void
export function Mark(...args: contentElement<'mark'>) { contentElement('mark', args) }

export function Code(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'code'>): void
export function Code(content: string | (() => void), options?: ModifierOptionsOf<'code'>): void
export function Code(...args: contentElement<'code'>) { contentElement('code', args) }

export function Pre(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'pre'>): void
export function Pre(content: string | (() => void), options?: ModifierOptionsOf<'pre'>): void
export function Pre(...args: contentElement<'pre'>) { contentElement('pre', args) }

export function Blockquote(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'blockquote'>): void
export function Blockquote(content: string | (() => void), options?: ModifierOptionsOf<'blockquote'>): void
export function Blockquote(...args: contentElement<'blockquote'>) { contentElement('blockquote', args) }

export function Q(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'q'>): void
export function Q(content: string | (() => void), options?: ModifierOptionsOf<'q'>): void
export function Q(...args: contentElement<'q'>) { contentElement('q', args) }

export function Cite(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'cite'>): void
export function Cite(content: string | (() => void), options?: ModifierOptionsOf<'cite'>): void
export function Cite(...args: contentElement<'cite'>) { contentElement('cite', args) }

export function Time(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'time'>): void
export function Time(content: string | (() => void), options?: ModifierOptionsOf<'time'>): void
export function Time(...args: contentElement<'time'>) { contentElement('time', args) }

export function Br(modifier?: Modifier, options?: OptionsOf<'br'>): void
export function Br(options?: ModifierOptionsOf<'br'>): void
export function Br(...args: voidElement<'br'>) { voidElement('br', args) }

export function Hr(modifier?: Modifier, options?: OptionsOf<'hr'>): void
export function Hr(options?: ModifierOptionsOf<'hr'>): void
export function Hr(...args: voidElement<'hr'>) { voidElement('hr', args) }

// Lists

export function Ul(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'ul'>): void
export function Ul(content: string | (() => void), options?: ModifierOptionsOf<'ul'>): void
export function Ul(...args: contentElement<'ul'>) { contentElement('ul', args) }

export function Ol(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'ol'>): void
export function Ol(content: string | (() => void), options?: ModifierOptionsOf<'ol'>): void
export function Ol(...args: contentElement<'ol'>) { contentElement('ol', args) }

export function Li(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'li'>): void
export function Li(content: string | (() => void), options?: ModifierOptionsOf<'li'>): void
export function Li(...args: contentElement<'li'>) { contentElement('li', args) }

export function Dl(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'dl'>): void
export function Dl(content: string | (() => void), options?: ModifierOptionsOf<'dl'>): void
export function Dl(...args: contentElement<'dl'>) { contentElement('dl', args) }

export function Dt(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'dt'>): void
export function Dt(content: string | (() => void), options?: ModifierOptionsOf<'dt'>): void
export function Dt(...args: contentElement<'dt'>) { contentElement('dt', args) }

export function Dd(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'dd'>): void
export function Dd(content: string | (() => void), options?: ModifierOptionsOf<'dd'>): void
export function Dd(...args: contentElement<'dd'>) { contentElement('dd', args) }

// Forms

export function Form(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'form'>): void
export function Form(content: string | (() => void), options?: ModifierOptionsOf<'form'>): void
export function Form(...args: contentElement<'form'>) { contentElement('form', args) }

export function Label(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'label'>): void
export function Label(content: string | (() => void), options?: ModifierOptionsOf<'label'>): void
export function Label(...args: contentElement<'label'>) { contentElement('label', args) }

export function Button(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'button'> & { onClick?: () => void }): void
export function Button(content: string | (() => void), options?: ModifierOptionsOf<'button'> & { onClick?: () => void }): void
export function Button(...args: contentElement<'button', { onClick?: () => void }>) {
    contentElement('button', args, {
        optionsToDelete: ['onClick'],
        interceptModifier: (initialModifier, options) => {
            let modifier = Modifier(initialModifier)
            if (options?.onClick)
                modifier = modifier.onClick(options.onClick)
            return modifier
        }
    })
}

export function Input(modifier?: Modifier, options?: OptionsOf<'input'>): void
export function Input(options?: ModifierOptionsOf<'input'>): void
export function Input(...args: voidElement<'input'>) { voidElement('input', args) }

export function Textarea(value: string, modifier?: Modifier, options?: OptionsOf<'textarea'>): void
export function Textarea(value: string, options?: ModifierOptionsOf<'textarea'>): void
export function Textarea(value: string, ...args: voidElement<'textarea'>) {
    voidElement('textarea', args, {
        interceptModifier: (modifier) => Modifier(modifier)
            .property<HTMLTextAreaElement>(element => {
                console.log('Update')
                element.value = value
            })
    })
}

export function Select(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'select'>): void
export function Select(content: string | (() => void), options?: ModifierOptionsOf<'select'>): void
export function Select(...args: contentElement<'select'>) { contentElement('select', args) }

export function Option(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'option'>): void
export function Option(content: string | (() => void), options?: ModifierOptionsOf<'option'>): void
export function Option(...args: contentElement<'option'>) { contentElement('option', args) }

export function Optgroup(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'optgroup'>): void
export function Optgroup(content: string | (() => void), options?: ModifierOptionsOf<'optgroup'>): void
export function Optgroup(...args: contentElement<'optgroup'>) { contentElement('optgroup', args) }

export function Fieldset(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'fieldset'>): void
export function Fieldset(content: string | (() => void), options?: ModifierOptionsOf<'fieldset'>): void
export function Fieldset(...args: contentElement<'fieldset'>) { contentElement('fieldset', args) }

export function Legend(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'legend'>): void
export function Legend(content: string | (() => void), options?: ModifierOptionsOf<'legend'>): void
export function Legend(...args: contentElement<'legend'>) { contentElement('legend', args) }

export function Datalist(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'datalist'>): void
export function Datalist(content: string | (() => void), options?: ModifierOptionsOf<'datalist'>): void
export function Datalist(...args: contentElement<'datalist'>) { contentElement('datalist', args) }

export function Output(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'output'>): void
export function Output(content: string | (() => void), options?: ModifierOptionsOf<'output'>): void
export function Output(...args: contentElement<'output'>) { contentElement('output', args) }

export function Progress(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'progress'>): void
export function Progress(content: string | (() => void), options?: ModifierOptionsOf<'progress'>): void
export function Progress(...args: contentElement<'progress'>) { contentElement('progress', args) }

export function Meter(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'meter'>): void
export function Meter(content: string | (() => void), options?: ModifierOptionsOf<'meter'>): void
export function Meter(...args: contentElement<'meter'>) { contentElement('meter', args) }

// Media and embedded content

export function Img(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'img'>): void
export function Img(content: string | (() => void), options?: ModifierOptionsOf<'img'>): void
export function Img(...args: contentElement<'img'>) { contentElement('img', args) }

export function Picture(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'picture'>): void
export function Picture(content: string | (() => void), options?: ModifierOptionsOf<'picture'>): void
export function Picture(...args: contentElement<'picture'>) { contentElement('picture', args) }

export function Source(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'source'>): void
export function Source(content: string | (() => void), options?: ModifierOptionsOf<'source'>): void
export function Source(...args: contentElement<'source'>) { contentElement('source', args) }

export function Audio(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'audio'>): void
export function Audio(content: string | (() => void), options?: ModifierOptionsOf<'audio'>): void
export function Audio(...args: contentElement<'audio'>) { contentElement('audio', args) }

export function Video(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'video'>): void
export function Video(content: string | (() => void), options?: ModifierOptionsOf<'video'>): void
export function Video(...args: contentElement<'video'>) { contentElement('video', args) }

export function Canvas(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'canvas'>): void
export function Canvas(content: string | (() => void), options?: ModifierOptionsOf<'canvas'>): void
export function Canvas(...args: contentElement<'canvas'>) { contentElement('canvas', args) }

export function Iframe(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'iframe'>): void
export function Iframe(content: string | (() => void), options?: ModifierOptionsOf<'iframe'>): void
export function Iframe(...args: contentElement<'iframe'>) { contentElement('iframe', args) }

export function Figure(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'figure'>): void
export function Figure(content: string | (() => void), options?: ModifierOptionsOf<'figure'>): void
export function Figure(...args: contentElement<'figure'>) { contentElement('figure', args) }

export function Figcaption(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'figcaption'>): void
export function Figcaption(content: string | (() => void), options?: ModifierOptionsOf<'figcaption'>): void
export function Figcaption(...args: contentElement<'figcaption'>) { contentElement('figcaption', args) }

// Tables

export function Table(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'table'>): void
export function Table(content: string | (() => void), options?: ModifierOptionsOf<'table'>): void
export function Table(...args: contentElement<'table'>) { contentElement('table', args) }

export function Caption(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'caption'>): void
export function Caption(content: string | (() => void), options?: ModifierOptionsOf<'caption'>): void
export function Caption(...args: contentElement<'caption'>) { contentElement('caption', args) }

export function Colgroup(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'colgroup'>): void
export function Colgroup(content: string | (() => void), options?: ModifierOptionsOf<'colgroup'>): void
export function Colgroup(...args: contentElement<'colgroup'>) { contentElement('colgroup', args) }

export function Col(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'col'>): void
export function Col(content: string | (() => void), options?: ModifierOptionsOf<'col'>): void
export function Col(...args: contentElement<'col'>) { contentElement('col', args) }

export function Thead(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'thead'>): void
export function Thead(content: string | (() => void), options?: ModifierOptionsOf<'thead'>): void
export function Thead(...args: contentElement<'thead'>) { contentElement('thead', args) }

export function Tbody(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'tbody'>): void
export function Tbody(content: string | (() => void), options?: ModifierOptionsOf<'tbody'>): void
export function Tbody(...args: contentElement<'tbody'>) { contentElement('tbody', args) }

export function Tfoot(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'tfoot'>): void
export function Tfoot(content: string | (() => void), options?: ModifierOptionsOf<'tfoot'>): void
export function Tfoot(...args: contentElement<'tfoot'>) { contentElement('tfoot', args) }

export function Tr(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'tr'>): void
export function Tr(content: string | (() => void), options?: ModifierOptionsOf<'tr'>): void
export function Tr(...args: contentElement<'tr'>) { contentElement('tr', args) }

export function Th(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'th'>): void
export function Th(content: string | (() => void), options?: ModifierOptionsOf<'th'>): void
export function Th(...args: contentElement<'th'>) { contentElement('th', args) }

export function Td(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'td'>): void
export function Td(content: string | (() => void), options?: ModifierOptionsOf<'td'>): void
export function Td(...args: contentElement<'td'>) { contentElement('td', args) }

// Interactive disclosure

export function Details(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'details'>): void
export function Details(content: string | (() => void), options?: ModifierOptionsOf<'details'>): void
export function Details(...args: contentElement<'details'>) { contentElement('details', args) }

export function Summary(content: string | (() => void), modifier?: Modifier, options?: OptionsOf<'summary'>): void
export function Summary(content: string | (() => void), options?: ModifierOptionsOf<'summary'>): void
export function Summary(...args: contentElement<'summary'>) { contentElement('summary', args) }





///////////
///////////
///////////
///////////
///////////




type voidOrContentElement<TAG extends keyof HTMLElementTagNameMap, EXTRA_OPTIONS extends object = object> =
    contentElement<TAG, EXTRA_OPTIONS> | voidElement<TAG, EXTRA_OPTIONS>

type contentElement<TAG extends keyof HTMLElementTagNameMap, EXTRA_OPTIONS extends object = object> = [
    content: string | (() => void),
    mooA?: Modifier | (ModifierOptionsOf<TAG> & EXTRA_OPTIONS),
    mooB?: OptionsOf<TAG> & EXTRA_OPTIONS
]
function contentElement<TAG extends keyof HTMLElementTagNameMap, EXTRA_OPTIONS extends object>(
    tag: TAG,
    [content, mooA, mooB]: contentElement<TAG, EXTRA_OPTIONS>,
    extras?: {
        optionsToDelete?: string[]
        interceptModifier?: (modifier: Modifier, options?: OptionsOf<TAG> & EXTRA_OPTIONS) => Modifier
    }
) {
    const [modifier, options] = parseModifierOrOptions(mooA, mooB)
    const lambdaContent = typeof content === 'string' ? () => Text(content) : content
    const elementOptions = { ...options }
    for (const optionToDelete of extras?.optionsToDelete ?? [])
        Reflect.deleteProperty(elementOptions, optionToDelete)
    TagElement(tag, lambdaContent, extras?.interceptModifier?.(modifier, options) ?? modifier, elementOptions)
}

type voidElement<TAG extends keyof HTMLElementTagNameMap, EXTRA_OPTIONS extends object = object> = [
    mooA?: Modifier | (ModifierOptionsOf<TAG> & EXTRA_OPTIONS),
    mooB?: OptionsOf<TAG> & EXTRA_OPTIONS
]
function voidElement<TAG extends keyof HTMLElementTagNameMap, EXTRA_OPTIONS extends object>(
    tag: TAG,
    [mooA, mooB]: voidElement<TAG, EXTRA_OPTIONS>,
    extras?: {
        optionsToDelete?: string[]
        interceptModifier?: (modifier: Modifier, options?: OptionsOf<TAG> & EXTRA_OPTIONS) => Modifier
    }
) {
    const [modifier, options] = parseModifierOrOptions(mooA, mooB)
    const elementOptions = { ...options }
    for (const optionToDelete of extras?.optionsToDelete ?? [])
        Reflect.deleteProperty(elementOptions, optionToDelete)
    TagElement(tag, undefined, extras?.interceptModifier?.(modifier, options) ?? modifier, elementOptions)
}
