import * as fs from 'node:fs'
import * as NotcomposeRuntimeDebug from '@notcompose/core'
import * as Console from 'node:console'
import process from 'node:process'
import path from 'node:path'
import { InputProcessor } from './runtime-input/InputProcessor.js'
import { RootInputDispatcher } from './runtime-input/InputDispatcher.js'
import { bootstrapTerminalComposition } from './bootstrapTerminalComposition.js'
import { ConsoleOutputProcessor } from './runtime-output/OutputProcessor.js'
import { StdinInputSource } from './runtime-input/StdinInputSource.js'

const findAppLogFile = (dir: string = process.cwd()): string => {
    const file = fs.readdirSync(dir).find(it => it === 'app.log' || it === 'package.json')
    if (file) return path.join(dir, 'app.log')
    return findAppLogFile(path.dirname(dir)) ?? './app.log'
}

const appLogStream = fs.createWriteStream(findAppLogFile())
const appLogConsole = new Console.Console({ stdout: appLogStream, stderr: appLogStream })
NotcomposeRuntimeDebug.setDebugConsole(appLogConsole)

export function setTerminalContent(content: () => void) {
    const bootstrap = bootstrapTerminalComposition()

    // Обходит дерево, ищет на ноды с InputModifier для обработки ввода с клавиатуры
    const inputProcessor = new InputProcessor(
        new StdinInputSource(),
        new RootInputDispatcher(
            () => bootstrap.compositionRunner.rootNode,
            (_, key: any) => {
                if (key?.ctrl && key?.name === 'c')
                    process.exit(0)
                return false
            }
        )
    )

    // Рисует кадр в console
    // Перед отрисовкой нужно сделать remeasure: вызвать layoutProcessor.layout()
    const outputProcessor = new ConsoleOutputProcessor(process.stdout, {
        before: () => {
            // hide cursor
            process.stdout.write('\x1B[?25l')
        },
        after: () => {
            process.stdout.cursorTo(0, 0)
        }
    })

    bootstrap.compositionRunner.setContent(content)

    bootstrap.start({
        inputProcessor: inputProcessor,
        outputProcessor: outputProcessor,
        fps: 30,
        redrawOnViewportResize: true,
    })
}
