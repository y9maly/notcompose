import {ElementArgument, ElementOptions, TagElement} from "./TagElement.js";

type Argument<TAG extends keyof HTMLElementTagNameMap> = ElementArgument<HTMLElementTagNameMap[TAG]>
type Options<TAG extends keyof HTMLElementTagNameMap> = ElementOptions<HTMLElementTagNameMap[TAG]>

// Document metadata

export function Html(argument?: Argument<'html'>) { TagElement('html', argument) }
export function Head(argument?: Argument<'head'>) { TagElement('head', argument) }
export function Body(argument?: Argument<'body'>) { TagElement('body', argument) }
export function Title(argument?: Argument<'title'>) { TagElement('title', argument) }
export function Meta(argument?: Options<'meta'>) { TagElement('meta', argument) }
export function Link(argument?: Options<'link'>) { TagElement('link', argument) }
export function Style(argument?: Argument<'style'>) { TagElement('style', argument) }
export function Script(argument?: Argument<'script'>) { TagElement('script', argument) }

// Page structure

export function Address(argument?: Argument<'address'>) { TagElement('address', argument) }
export function Article(argument?: Argument<'article'>) { TagElement('article', argument) }
export function Aside(argument?: Argument<'aside'>) { TagElement('aside', argument) }
export function Header(argument?: Argument<'header'>) { TagElement('header', argument) }
export function Footer(argument?: Argument<'footer'>) { TagElement('footer', argument) }
export function Main(argument?: Argument<'main'>) { TagElement('main', argument) }
export function Nav(argument?: Argument<'nav'>) { TagElement('nav', argument) }
export function Section(argument?: Argument<'section'>) { TagElement('section', argument) }
export function Div(argument?: Argument<'div'>) { TagElement('div', argument) }
export function Span(argument?: Argument<'span'>) { TagElement('span', argument) }

// Text content

export function H1(argument?: Argument<'h1'>) { TagElement('h1', argument) }
export function H2(argument?: Argument<'h2'>) { TagElement('h2', argument) }
export function H3(argument?: Argument<'h3'>) { TagElement('h3', argument) }
export function H4(argument?: Argument<'h4'>) { TagElement('h4', argument) }
export function H5(argument?: Argument<'h5'>) { TagElement('h5', argument) }
export function H6(argument?: Argument<'h6'>) { TagElement('h6', argument) }
export function P(argument?: Argument<'p'>) { TagElement('p', argument) }
export function A(argument?: Argument<'a'>) { TagElement('a', argument) }
export function B(argument?: Argument<'b'>) { TagElement('b', argument) }
export function Strong(argument?: Argument<'strong'>) { TagElement('strong', argument) }
export function I(argument?: Argument<'i'>) { TagElement('i', argument) }
export function Em(argument?: Argument<'em'>) { TagElement('em', argument) }
export function Small(argument?: Argument<'small'>) { TagElement('small', argument) }
export function Mark(argument?: Argument<'mark'>) { TagElement('mark', argument) }
export function Code(argument?: Argument<'code'>) { TagElement('code', argument) }
export function Pre(argument?: Argument<'pre'>) { TagElement('pre', argument) }
export function Blockquote(argument?: Argument<'blockquote'>) { TagElement('blockquote', argument) }
export function Q(argument?: Argument<'q'>) { TagElement('q', argument) }
export function Cite(argument?: Argument<'cite'>) { TagElement('cite', argument) }
export function Time(argument?: Argument<'time'>) { TagElement('time', argument) }
export function Br(argument?: Options<'br'>) { TagElement('br', argument) }
export function Hr(argument?: Options<'hr'>) { TagElement('hr', argument) }

// Lists

export function Ul(argument?: Argument<'ul'>) { TagElement('ul', argument) }
export function Ol(argument?: Argument<'ol'>) { TagElement('ol', argument) }
export function Li(argument?: Argument<'li'>) { TagElement('li', argument) }
export function Dl(argument?: Argument<'dl'>) { TagElement('dl', argument) }
export function Dt(argument?: Argument<'dt'>) { TagElement('dt', argument) }
export function Dd(argument?: Argument<'dd'>) { TagElement('dd', argument) }

// Forms

export function Form(argument?: Argument<'form'>) { TagElement('form', argument) }
export function Label(argument?: Argument<'label'>) { TagElement('label', argument) }
export function Button(argument?: Argument<'button'>) { TagElement('button', argument) }
export function Input(argument?: Options<'input'>) { TagElement('input', argument) }
export function Textarea(argument?: Argument<'textarea'>) { TagElement('textarea', argument) }
export function Select(argument?: Argument<'select'>) { TagElement('select', argument) }
export function Option(argument?: Argument<'option'>) { TagElement('option', argument) }
export function Optgroup(argument?: Argument<'optgroup'>) { TagElement('optgroup', argument) }
export function Fieldset(argument?: Argument<'fieldset'>) { TagElement('fieldset', argument) }
export function Legend(argument?: Argument<'legend'>) { TagElement('legend', argument) }
export function Datalist(argument?: Argument<'datalist'>) { TagElement('datalist', argument) }
export function Output(argument?: Argument<'output'>) { TagElement('output', argument) }
export function Progress(argument?: Argument<'progress'>) { TagElement('progress', argument) }
export function Meter(argument?: Argument<'meter'>) { TagElement('meter', argument) }

// Media and embedded content

export function Img(argument?: Options<'img'>) { TagElement('img', argument) }
export function Picture(argument?: Argument<'picture'>) { TagElement('picture', argument) }
export function Source(argument?: Options<'source'>) { TagElement('source', argument) }
export function Audio(argument?: Argument<'audio'>) { TagElement('audio', argument) }
export function Video(argument?: Argument<'video'>) { TagElement('video', argument) }
export function Canvas(argument?: Argument<'canvas'>) { TagElement('canvas', argument) }
export function Iframe(argument?: Argument<'iframe'>) { TagElement('iframe', argument) }
export function Figure(argument?: Argument<'figure'>) { TagElement('figure', argument) }
export function Figcaption(argument?: Argument<'figcaption'>) { TagElement('figcaption', argument) }

// Tables

export function Table(argument?: Argument<'table'>) { TagElement('table', argument) }
export function Caption(argument?: Argument<'caption'>) { TagElement('caption', argument) }
export function Colgroup(argument?: Argument<'colgroup'>) { TagElement('colgroup', argument) }
export function Col(argument?: Options<'col'>) { TagElement('col', argument) }
export function Thead(argument?: Argument<'thead'>) { TagElement('thead', argument) }
export function Tbody(argument?: Argument<'tbody'>) { TagElement('tbody', argument) }
export function Tfoot(argument?: Argument<'tfoot'>) { TagElement('tfoot', argument) }
export function Tr(argument?: Argument<'tr'>) { TagElement('tr', argument) }
export function Th(argument?: Argument<'th'>) { TagElement('th', argument) }
export function Td(argument?: Argument<'td'>) { TagElement('td', argument) }

// Interactive disclosure

export function Details(argument?: Argument<'details'>) { TagElement('details', argument) }
export function Summary(argument?: Argument<'summary'>) { TagElement('summary', argument) }
