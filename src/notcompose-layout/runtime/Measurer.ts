import {CompleteMeasurerPlugin, MeasurerPlugin} from "./MeasurerPlugin";
import {MeasurerPluginContext} from "./MeasurerPluginContext";
import {LayoutModifierLayoutNodeCoordinator} from "./LayoutModifierLayoutNodeCoordinator";
import {MeasureResult} from "../../notcompose-terminal/runtime/layout/Measurable";
import {LayoutNodeCoordinator} from "./LayoutNodeCoordinator";

interface Frame {
    coordinator: LayoutNodeCoordinator
}

export class Measurer {
    private readonly plugins: ReadonlyArray<CompleteMeasurerPlugin>
    private readonly pluginContext: MeasurerPluginContext = {
        measurer: this,
    }

    constructor(
        plugins: ReadonlyArray<MeasurerPlugin>
    ) {
        this.plugins = plugins.map(plugin => {
            const substitutedPlugin = plugin.attach ? plugin.attach(this.pluginContext) : undefined
            return CompleteMeasurerPlugin(substitutedPlugin ?? plugin)
        })
    }

    private readonly frames: Frame[] = []

    startMeasurement(coordinator: LayoutNodeCoordinator) {
        this.frames.push({ coordinator })
        this.plugins.forEach(plugin => plugin.onStartMeasurement(coordinator))
    }

    exitMeasurement() {
        this.plugins.forEach(plugin => plugin.onExitMeasurement())
    }

    reenterMeasurement() {
        this.plugins.forEach(plugin => plugin.onReenterMeasurement())
    }

    endMeasurement(measureResult: MeasureResult) {
        const frame = this.frames.pop()
        if (frame === undefined)
            throw new Error('Cannot end measurement here')
        const { coordinator } = frame

        coordinator.measure(measureResult)

        this.plugins.forEach(plugin => plugin.onEndMeasurement(coordinator))
    }
}
