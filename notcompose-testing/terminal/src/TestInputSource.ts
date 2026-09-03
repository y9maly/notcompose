import type { InputSource } from '@notcompose/terminal'
import type { TestInput } from './TestInput.js'

export class TestInputSource implements InputSource, TestInput {
    private listener?: (string: string, key: any) => void

    start(listener: (string: string, key: any) => void): Disposable {
        const thisInputSource = this
        this.listener = listener
        return {
            [Symbol.dispose]() {
                thisInputSource.listener = undefined
            }
        }
    }

    emulate(string: string, key: any) {
        if (this.listener) {
            this.listener(string, key)
        }
    }
}
