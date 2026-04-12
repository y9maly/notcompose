import {RawInfoViewModel} from "./RawInfoViewModel";
import {Modifier} from "../../../notcompose/runtime/Modifier";
import {Column} from "../../../notcompose-terminal/highlevel/Column";
import {Text} from "../../../notcompose-terminal/highlevel/Text";
import {Alignment} from "../../../notcompose-terminal/runtime/ui/Alignment";


export function RawInfoScreen(
    viewModel: RawInfoViewModel,
    modifier: Modifier = new Modifier(),
) {
    Variant2(viewModel, modifier)
}

function Variant1(
    viewModel: RawInfoViewModel,
    modifier: Modifier = new Modifier(),
) {
    Column(() => {
        Text(`CPU's count      : ${viewModel.cpusCount.value}`)
        Text(`Memory available : ${viewModel.totalMemory.value} bytes`)
        Text(`Arch             : ${viewModel.arch.value}`)
        Text(`Home directory   : ${viewModel.homedir.value}`)
        Text(`Host name        : ${viewModel.hostname.value}`)
        Text(`OS type          : ${viewModel.osType.value}`)
        Text(`OS version       : ${viewModel.osVersion.value}`)
        Text(`Username         : ${viewModel.username.value}`)
    }, modifier, {
        horizontalAlignment: Alignment.CenterHorizontally
    })
}

function Variant2(
    viewModel: RawInfoViewModel,
    modifier: Modifier = new Modifier(),
) {
    Column(() => {
        Text(`CPU's count : ${viewModel.cpusCount.value}`)
        Text(`Memory available : ${viewModel.totalMemory.value} bytes`)
        Text(`Arch : ${viewModel.arch.value}`)
        Text(`Home directory : ${viewModel.homedir.value}`)
        Text(`Host name : ${viewModel.hostname.value}`)
        Text(`OS type : ${viewModel.osType.value}`)
        Text(`OS version : ${viewModel.osVersion.value}`)
        Text(`Username : ${viewModel.username.value}`)
    }, modifier, {
        horizontalAlignment: Alignment.CenterHorizontally
    })
}
