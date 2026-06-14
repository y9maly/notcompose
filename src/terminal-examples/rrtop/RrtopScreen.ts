import {DisposableEffect, Key, Modifier, remember, rememberState} from "notcompose";
import {MainViewModel} from "./mainScreen/MainViewModel.js";
import {NodejsSystemInfoRepository, SystemInfoRepository} from "./repository/SystemInfoRepository.js";
import {MainScreen} from "./mainScreen/MainScreen.js";
import {Box, Column, ConstraintsModifiers, FillMaxSizeModifier, Row} from "notcompose/layout";
import {RawInfoViewModel} from "./rawInfoScreen/RawInfoViewModel.js";
import {RawInfoScreen} from "./rawInfoScreen/RawInfoScreen.js";
import {input, Text} from "notcompose/terminal";
import {Divider} from "../common/Divider.js";

type Screen = 'Main' | 'RawInfo'
const screens: Screen[] = ['Main', 'RawInfo']

// const systemInfoRepository: SystemInfoRepository = new FakeSystemInfoRepository()
const systemInfoRepository: SystemInfoRepository = new NodejsSystemInfoRepository()

export function RrtopScreen(
    modifier: Modifier = new Modifier(),
) {
    const mainViewModel = remember(() => new MainViewModel(systemInfoRepository))

    DisposableEffect(() => {
        const disposable = mainViewModel.start()
        return () => disposable[Symbol.dispose]()
    })

    const activeScreenIndex = rememberState(() => 0)

    input((str, key) => {
        if (key.name === 'left' && activeScreenIndex.value > 0) {
            activeScreenIndex.value--
            return true
        } else if (key.name === 'right' && activeScreenIndex.value < screens.length - 1) {
            activeScreenIndex.value++
            return true
        }

        return false
    })

    Column(() => {
        const activeScreen = screens[activeScreenIndex.value]

        Box(() => {
            Key(activeScreen, () => {
                if (activeScreen === 'Main') {
                    MainScreen(mainViewModel, new Modifier([FillMaxSizeModifier()]))
                }

                if (activeScreen === 'RawInfo') {
                    const viewModel = remember(() => new RawInfoViewModel(systemInfoRepository))

                    RawInfoScreen(viewModel, new Modifier([FillMaxSizeModifier()]))
                }
            })
        }, new Modifier([
            // Сделать так, чтобы этот виджет занял всю высоту И минус 2 "пикселя?" высоты.
            // Это лучше было бы сделать через Weight или IntrinsicSize, но пока их нет
            ConstraintsModifiers.MinusMaxHeight(2),
        ]))

        Divider(`━`)

        Row(() => {
            for (const screen of screens) {
                if (screen === activeScreen) {
                    Text(`<${screen}>`)
                } else {
                    Text(` ${screen} `)
                }
            }
        })
    }, modifier)
}
