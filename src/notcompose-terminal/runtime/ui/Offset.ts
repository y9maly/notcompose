import {Float} from "../../../core/types";

export class Offset {
    constructor(
        public readonly x: Float,
        public readonly y: Float,
    ) {}

    static ZERO = new Offset(0, 0)

    equals(other: Offset) {
        return this.x === other.x && this.y === other.y
    }
}
