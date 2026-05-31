import {LayoutModifierLayoutNodeCoordinator} from "./LayoutModifierLayoutNodeCoordinator";
import {InnerLayoutNodeCoordinator} from "./InnerLayoutNodeCoordinator";
import {MeasureResult} from "../../notcompose-terminal/runtime/layout/Measurable";

export type LayoutNodeCoordinator = LayoutModifierLayoutNodeCoordinator | InnerLayoutNodeCoordinator

export abstract class BaseLayoutNodeCoordinator {
    isMeasured: boolean = false
    isPlaced: boolean = false
    placeChildren: () => void = NoOp
    width: number = 0
    height: number = 0
    x: number = 0
    y: number = 0
    z: number = 0

    clearMeasure(): void {
        this.isMeasured = false
        this.width = 0
        this.height = 0
        this.placeChildren = NoOp
    }

    clearPlace() {
        this.isPlaced = false
        this.x = 0
        this.y = 0
        this.z = 0
    }

    measure(measureResult: MeasureResult): void {
        this.isMeasured = true
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = measureResult.placeChildren.bind(measureResult)
    }

    place(x: number, y: number, z?: number) {
        this.isPlaced = true
        this.x = x
        this.y = y
        this.z = z ?? 0
    }
}

function NoOp() {}
