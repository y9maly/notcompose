import { Offset } from './Offset.js'

export class Size {
    constructor(
        public readonly width: number,
        public readonly height: number,
    ) {}

    get center(): Offset {
        return new Offset(this.width / 2, this.height / 2)
    }
}
