import { Composer, Recomposer } from 'notcompose'
import { HtmlComposition } from './Composition.js'
import { bootstrapHtmlComposition, type HtmlCompositionController } from './bootstrapHtmlComposition.js'

export interface RenderedHtmlComposition extends HtmlCompositionController {
    readonly composer: Composer
    readonly recomposer: Recomposer
    readonly composition: HtmlComposition
    readonly root: Element
}

export function renderHtml(
    root: Element | string,
    content: () => void,
): RenderedHtmlComposition {
    const rootElement = resolveRoot(root)
    const bootstrap = bootstrapHtmlComposition(rootElement)
    bootstrap.composition.setContent(content)
    const controller = bootstrap.start()

    return {
        ...controller,
        composer: bootstrap.composer,
        recomposer: bootstrap.recomposer,
        composition: bootstrap.composition,
        root: rootElement,
    }
}

function resolveRoot(root: Element | string): Element {
    if (typeof root !== 'string')
        return root

    const rootElement = document.getElementById(root)
    if (rootElement === null)
        throw new Error(`Cannot find HTML composition root with id '${root}'`)
    return rootElement
}
