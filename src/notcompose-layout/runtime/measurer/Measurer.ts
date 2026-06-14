import {CompleteMeasurerPlugin, MeasurerPlugin} from "./MeasurerPlugin.js";
import {MeasurerPluginContext} from "./MeasurerPluginContext.js";
import {MeasureResult} from "../Measurable.js";
import {LayoutNodeCoordinator} from "../layoutNode/LayoutNodeCoordinator.js";
import {Constraints} from "../Constraints.js";

interface Frame {
    coordinator: LayoutNodeCoordinator
    constraints: Constraints
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

    startMeasurement(coordinator: LayoutNodeCoordinator, constraints: Constraints) {
        this.frames.push({ coordinator, constraints })
        this.plugins.forEach(plugin => plugin.onStartMeasurement(coordinator, constraints))
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
        const { coordinator, constraints } = frame

        coordinator.makeMeasured(measureResult)

        this.plugins.forEach(plugin => plugin.onEndMeasurement(coordinator, constraints, measureResult))
    }
}
