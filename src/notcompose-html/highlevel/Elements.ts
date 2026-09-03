import { TagElement } from './TagElement.js'
import { type Args, contentOf, modifierOf, type Options, optionsOf } from './types.js'
import { Modifier } from '../HtmlModifier.js'

type ElementOf<TAG extends keyof HTMLElementTagNameMap> = HTMLElementTagNameMap[TAG]
type SpecificKeys<TAG extends keyof HTMLElementTagNameMap> = Exclude<keyof ElementOf<TAG>, keyof HTMLElement>
type ElementOptions<TAG extends keyof HTMLElementTagNameMap> = {
    [KEY in SpecificKeys<TAG> as KEY extends string ? KEY : never]?: ElementOf<TAG>[KEY]
}

type ArgsOf<TAG extends keyof HTMLElementTagNameMap> = Args<ElementOptions<TAG>>

// Document metadata

export function Html(...args: ArgsOf<'html'>) { TagElement('html', ...args) }
export function Head(...args: ArgsOf<'head'>) { TagElement('head', ...args) }
export function Body(...args: ArgsOf<'body'>) { TagElement('body', ...args) }
export function Title(...args: ArgsOf<'title'>) { TagElement('title', ...args) }
export function Meta(...args: ArgsOf<'meta'>) { TagElement('meta', ...args) }
export function Link(...args: ArgsOf<'link'>) { TagElement('link', ...args) }
export function Style(...args: ArgsOf<'style'>) { TagElement('style', ...args) }
export function Script(...args: ArgsOf<'script'>) { TagElement('script', ...args) }

// Page structure

export function Address(...args: ArgsOf<'address'>) { TagElement('address', ...args) }
export function Article(...args: ArgsOf<'article'>) { TagElement('article', ...args) }
export function Aside(...args: ArgsOf<'aside'>) { TagElement('aside', ...args) }
export function Header(...args: ArgsOf<'header'>) { TagElement('header', ...args) }
export function Footer(...args: ArgsOf<'footer'>) { TagElement('footer', ...args) }
export function Main(...args: ArgsOf<'main'>) { TagElement('main', ...args) }
export function Nav(...args: ArgsOf<'nav'>) { TagElement('nav', ...args) }
export function Section(...args: ArgsOf<'section'>) { TagElement('section', ...args) }
export function Div(...args: ArgsOf<'div'>) { TagElement('div', ...args) }
export function Span(...args: ArgsOf<'span'>) { TagElement('span', ...args) }

// Text content

export function H1(...args: ArgsOf<'h1'>) { TagElement('h1', ...args) }
export function H2(...args: ArgsOf<'h2'>) { TagElement('h2', ...args) }
export function H3(...args: ArgsOf<'h3'>) { TagElement('h3', ...args) }
export function H4(...args: ArgsOf<'h4'>) { TagElement('h4', ...args) }
export function H5(...args: ArgsOf<'h5'>) { TagElement('h5', ...args) }
export function H6(...args: ArgsOf<'h6'>) { TagElement('h6', ...args) }
export function P(...args: ArgsOf<'p'>) { TagElement('p', ...args) }
export function A(...args: ArgsOf<'a'>) { TagElement('a', ...args) }
export function B(...args: ArgsOf<'b'>) { TagElement('b', ...args) }
export function Strong(...args: ArgsOf<'strong'>) { TagElement('strong', ...args) }
export function I(...args: ArgsOf<'i'>) { TagElement('i', ...args) }
export function Em(...args: ArgsOf<'em'>) { TagElement('em', ...args) }
export function Small(...args: ArgsOf<'small'>) { TagElement('small', ...args) }
export function Mark(...args: ArgsOf<'mark'>) { TagElement('mark', ...args) }
export function Code(...args: ArgsOf<'code'>) { TagElement('code', ...args) }
export function Pre(...args: ArgsOf<'pre'>) { TagElement('pre', ...args) }
export function Blockquote(...args: ArgsOf<'blockquote'>) { TagElement('blockquote', ...args) }
export function Q(...args: ArgsOf<'q'>) { TagElement('q', ...args) }
export function Cite(...args: ArgsOf<'cite'>) { TagElement('cite', ...args) }
export function Time(...args: ArgsOf<'time'>) { TagElement('time', ...args) }
export function Br(...args: ArgsOf<'br'>) { TagElement('br', ...args) }
export function Hr(...args: ArgsOf<'hr'>) { TagElement('hr', ...args) }

// Lists

export function Ul(...args: ArgsOf<'ul'>) { TagElement('ul', ...args) }
export function Ol(...args: ArgsOf<'ol'>) { TagElement('ol', ...args) }
export function Li(...args: ArgsOf<'li'>) { TagElement('li', ...args) }
export function Dl(...args: ArgsOf<'dl'>) { TagElement('dl', ...args) }
export function Dt(...args: ArgsOf<'dt'>) { TagElement('dt', ...args) }
export function Dd(...args: ArgsOf<'dd'>) { TagElement('dd', ...args) }

// Forms

export function Form(...args: ArgsOf<'form'>) { TagElement('form', ...args) }
export function Label(...args: ArgsOf<'label'>) { TagElement('label', ...args) }
export function Button(...args: ArgsOf<'button'>) { TagElement('button', ...args) }
export function Input(...args: ArgsOf<'input'>) { TagElement('input', ...args) }
export function Textarea(...args: ArgsOf<'textarea'>) { TagElement('textarea', ...args) }
export function Select(...args: ArgsOf<'select'>) { TagElement('select', ...args) }
export function Option(...args: ArgsOf<'option'>) { TagElement('option', ...args) }
export function Optgroup(...args: ArgsOf<'optgroup'>) { TagElement('optgroup', ...args) }
export function Fieldset(...args: ArgsOf<'fieldset'>) { TagElement('fieldset', ...args) }
export function Legend(...args: ArgsOf<'legend'>) { TagElement('legend', ...args) }
export function Datalist(...args: ArgsOf<'datalist'>) { TagElement('datalist', ...args) }
export function Output(...args: ArgsOf<'output'>) { TagElement('output', ...args) }
export function Progress(...args: ArgsOf<'progress'>) { TagElement('progress', ...args) }
export function Meter(...args: ArgsOf<'meter'>) { TagElement('meter', ...args) }

// Media and embedded content

export function Img(...args: ArgsOf<'img'>) { TagElement('img', ...args) }
export function Picture(...args: ArgsOf<'picture'>) { TagElement('picture', ...args) }
export function Source(...args: ArgsOf<'source'>) { TagElement('source', ...args) }
export function Audio(...args: ArgsOf<'audio'>) { TagElement('audio', ...args) }
export function Video(...args: ArgsOf<'video'>) { TagElement('video', ...args) }
export function Canvas(...args: ArgsOf<'canvas'>) { TagElement('canvas', ...args) }
export function Iframe(...args: ArgsOf<'iframe'>) { TagElement('iframe', ...args) }
export function Figure(...args: ArgsOf<'figure'>) { TagElement('figure', ...args) }
export function Figcaption(...args: ArgsOf<'figcaption'>) { TagElement('figcaption', ...args) }

// Tables

export function Table(...args: ArgsOf<'table'>) { TagElement('table', ...args) }
export function Caption(...args: ArgsOf<'caption'>) { TagElement('caption', ...args) }
export function Colgroup(...args: ArgsOf<'colgroup'>) { TagElement('colgroup', ...args) }
export function Col(...args: ArgsOf<'col'>) { TagElement('col', ...args) }
export function Thead(...args: ArgsOf<'thead'>) { TagElement('thead', ...args) }
export function Tbody(...args: ArgsOf<'tbody'>) { TagElement('tbody', ...args) }
export function Tfoot(...args: ArgsOf<'tfoot'>) { TagElement('tfoot', ...args) }
export function Tr(...args: ArgsOf<'tr'>) { TagElement('tr', ...args) }
export function Th(...args: ArgsOf<'th'>) { TagElement('th', ...args) }
export function Td(...args: ArgsOf<'td'>) { TagElement('td', ...args) }

// Interactive disclosure

export function Details(...args: ArgsOf<'details'>) { TagElement('details', ...args) }
export function Summary(...args: ArgsOf<'summary'>) { TagElement('summary', ...args) }
