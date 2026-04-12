import {SystemInfoRepository} from "../repository/SystemInfoRepository";
import {mutableStateOf} from "../../../notcompose/runtime-highlevel/mutableStateOf";


export class RawInfoViewModel {
    constructor(
        public systemInfoRepository: SystemInfoRepository,
    ) {
        this.cpusCount.value = systemInfoRepository.cpusCount()
        this.totalMemory.value = systemInfoRepository.totalMemory()
        this.arch.value = systemInfoRepository.arch()
        this.homedir.value = systemInfoRepository.homedir()
        this.hostname.value = systemInfoRepository.hostname()
        this.osType.value = systemInfoRepository.osType()
        this.osVersion.value = systemInfoRepository.osVersion()
        this.username.value = systemInfoRepository.username()
    }

    cpusCount = mutableStateOf(0)
    totalMemory = mutableStateOf(0)
    arch = mutableStateOf('')
    homedir = mutableStateOf('')
    hostname = mutableStateOf('')
    osType = mutableStateOf('')
    osVersion = mutableStateOf('')
    username = mutableStateOf('')
}