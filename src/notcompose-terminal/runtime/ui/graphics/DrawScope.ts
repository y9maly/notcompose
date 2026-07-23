import { TextCanvas } from './TextCanvas.js'

// todo do not inherent TextCanvas
export interface DrawScope extends TextCanvas {
    availableWidth: number
    availableHeight: number
}

export function DrawScope(
    canvas: TextCanvas,
    availableWidth: number,
    availableHeight: number,
): DrawScope {
    return new DrawScopeImpl(canvas, availableWidth, availableHeight)
}

class DrawScopeImpl implements DrawScope {
    constructor(
        private canvas: TextCanvas,
        private _availableWidth?: number,
        private _availableHeight?: number,
        public save = canvas.save.bind(canvas),
        public restore = canvas.restore.bind(canvas),
        public concat = canvas.concat.bind(canvas),
        public translate = canvas.translate.bind(canvas),
        public scale = canvas.scale.bind(canvas),
        public skew = canvas.skew.bind(canvas),
        public skewRad = canvas.skewRad.bind(canvas),
        public rotate = canvas.rotate.bind(canvas),
        public rotateRad = canvas.rotateRad.bind(canvas),
        public clipRect = canvas.clipRect.bind(canvas),
        public clipOutRect = canvas.clipOutRect.bind(canvas),
        public drawText = canvas.drawText.bind(canvas),
    ) {}

    get availableWidth() { return this._availableWidth ?? this.canvas.width }
    get availableHeight() { return this._availableHeight ?? this.canvas.height }
    get height() { return this.canvas.height }
    get width() { return this.canvas.width }
    get size() { return this.canvas.size }
}
