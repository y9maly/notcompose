import {RawInfoViewModel} from "./RawInfoViewModel.js";
import {Modifier} from "notcompose";
import {Alignment, Column} from "notcompose/layout";
import {Text} from "notcompose/terminal";

export function RawInfoScreen(
    viewModel: RawInfoViewModel,
    modifier: Modifier = Modifier,
) {
    Variant2(viewModel, modifier)
}

function Variant1(
    viewModel: RawInfoViewModel,
    modifier: Modifier = Modifier,
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
    modifier: Modifier = Modifier,
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
