import {LayoutModifierLayoutNodeCoordinator} from "./LayoutModifierLayoutNodeCoordinator";
import {InnerLayoutNodeCoordinator} from "./InnerLayoutNodeCoordinator";
import {MeasureResult} from "../Measurable";

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

    // todo временно
    findNode() { return this.findInnerNodeCoordinator().node }
    // todo временно
    findInnerNodeCoordinator(): InnerLayoutNodeCoordinator {
        let current = this as unknown as LayoutNodeCoordinator
        while (true) {
            // if (current instanceof InnerLayoutNodeCoordinator)
            if (!('nextCoordinator' in current))
                return current as unknown as InnerLayoutNodeCoordinator
            current = current.nextCoordinator
        }
    }

    makeUnmeasured(): void {
        this.isMeasured = false
        this.width = 0
        this.height = 0
        this.placeChildren = NoOp
    }

    makeUnplaced() {
        this.isPlaced = false
        this.x = 0
        this.y = 0
        this.z = 0
    }

    makeMeasured(measureResult: MeasureResult): void {
        this.isMeasured = true
        this.width = measureResult.width
        this.height = measureResult.height
        this.placeChildren = measureResult.placeChildren.bind(measureResult)
    }

    makePlaced(x: number, y: number, z?: number) {
        this.isPlaced = true
        this.x = x
        this.y = y
        this.z = z ?? 0
    }
}

function NoOp() {}
