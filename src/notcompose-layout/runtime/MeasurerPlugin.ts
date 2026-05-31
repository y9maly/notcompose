import {MeasurerPluginContext} from "./MeasurerPluginContext";
import {LayoutNodeCoordinator} from "./LayoutNodeCoordinator";

export interface MeasurerPlugin {
    attach?(context: MeasurerPluginContext): void | MeasurerPlugin
    initially?(): void
    finally?(): void
    dispose?(): void

    onStartMeasurement?(coordinator: LayoutNodeCoordinator): void
    onExitMeasurement?(): void
    onReenterMeasurement?(): void
    onEndMeasurement?(coordinator: LayoutNodeCoordinator): void
}

export interface CompleteMeasurerPlugin extends Required<MeasurerPlugin> {
}

function NoOp() {}

export function CompleteMeasurerPlugin(plugin: MeasurerPlugin): CompleteMeasurerPlugin {
    const completePlugin: CompleteMeasurerPlugin = {
        attach: plugin.attach?.bind(plugin) ?? (() => completePlugin),
        initially: plugin.initially?.bind(plugin) ?? NoOp,
        finally: plugin.finally?.bind(plugin) ?? NoOp,
        dispose: plugin.dispose?.bind(plugin) ?? NoOp,
        onStartMeasurement: plugin.onStartMeasurement?.bind(plugin) ?? NoOp,
        onExitMeasurement: plugin.onExitMeasurement?.bind(plugin) ?? NoOp,
        onReenterMeasurement: plugin.onReenterMeasurement?.bind(plugin) ?? NoOp,
        onEndMeasurement: plugin.onEndMeasurement?.bind(plugin) ?? NoOp,
    }
    return completePlugin
}

