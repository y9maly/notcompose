import {remember} from "../../notcompose/runtime-highlevel/remember";
import {MainViewModel} from "./mainScreen/MainViewModel";
import {DisposableEffect} from "../../notcompose/runtime-highlevel/DisposableEffect";
import {
    FakeSystemInfoRepository,
    NodejsSystemInfoRepository,
    SystemInfoRepository
} from "./repository/SystemInfoRepository";
import {rememberState} from "../../notcompose/runtime-highlevel/rememberState";
import {Key} from "../../notcompose/runtime-highlevel/Key";
import {MainScreen} from "./mainScreen/MainScreen";
import {Column} from "../../notcompose-terminal/highlevel/Column";
import {Modifier} from "../../notcompose/runtime/Modifier";
import {FillMaxSizeModifier} from "../../notcompose-terminal/runtime/modifiers/FillModifier";
import {RawInfoViewModel} from "./rawInfoScreen/RawInfoViewModel";
import {RawInfoScreen} from "./rawInfoScreen/RawInfoScreen";
import {input} from "../../notcompose-terminal/runtime/Input";
import {Box} from "../../notcompose-terminal/highlevel/Box";
import {ConstraintsModifiers} from "../../notcompose-terminal/runtime/modifiers/ConstraintsModifier";
import {Divider} from "../common/Divider";
import {Text} from "../../notcompose-terminal/highlevel/Text";
import {Row} from "../../notcompose-terminal/highlevel/Row";


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
