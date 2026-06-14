import {DrawScope} from "./DrawScope.js";

export interface ContentDrawScope extends DrawScope {
    drawContent(): void
}

export function ContentDrawScope(drawScope: DrawScope, drawContent: () => void): ContentDrawScope {
    return new ContentDrawScopeImpl(drawScope, drawContent)
}

class ContentDrawScopeImpl implements ContentDrawScope {
    constructor(
        private drawScope: DrawScope,
        public drawContent: () => void,
        public save = drawScope.save.bind(drawScope),
        public restore = drawScope.restore.bind(drawScope),
        public concat = drawScope.concat.bind(drawScope),
        public translate = drawScope.translate.bind(drawScope),
        public scale = drawScope.scale.bind(drawScope),
        public skew = drawScope.skew.bind(drawScope),
        public skewRad = drawScope.skewRad.bind(drawScope),
        public rotate = drawScope.rotate.bind(drawScope),
        public rotateRad = drawScope.rotateRad.bind(drawScope),
        public clipRect = drawScope.clipRect.bind(drawScope),
        public clipOutRect = drawScope.clipOutRect.bind(drawScope),
        public drawText = drawScope.drawText.bind(drawScope),
    ) {}

    get availableWidth() { return this.drawScope.availableWidth }
    get availableHeight() { return this.drawScope.availableHeight }
    get height() { return this.drawScope.height }
    get width() { return this.drawScope.width }
    get size() { return this.drawScope.size }
}
