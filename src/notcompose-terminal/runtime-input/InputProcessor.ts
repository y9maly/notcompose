import {InputDispatcher} from "./InputDispatcher";
import {InputSource} from "./InputSource";

export class InputProcessor {
    constructor(
        private source: InputSource,
        private dispatcher: InputDispatcher,
    ) {}

    private disposable?: Disposable

    start() {
        this.stop()
        this.disposable = this.source.start((string, key) => this.dispatcher.dispatch(string, key))
    }

    stop() {
        if (this.disposable)
            this.disposable[Symbol.dispose]()
    }
}
