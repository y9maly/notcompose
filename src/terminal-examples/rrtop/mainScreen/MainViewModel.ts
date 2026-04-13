import {mutableStateOf} from "../../../notcompose/runtime-highlevel/mutableStateOf";
import {HistoryData} from "../components/plot/HistoryData";
import {SystemInfoRepository} from "../repository/SystemInfoRepository";


export class MainViewModel {
    constructor(
        private systemInfoRepository: SystemInfoRepository
    ) {
        this.osType.value = systemInfoRepository.osType()
        this.osRelease.value = systemInfoRepository.osRelease()
        this.arch.value = systemInfoRepository.arch()
    }

    private historyDataCapacity = 200

    refreshRate = mutableStateOf(100)
    networkRefreshRate = mutableStateOf(400)

    cpusCount = mutableStateOf(0)
    cpuLoad = mutableStateOf(0)
    cpuLoadHistory = mutableStateOf<HistoryData>({ items: [] })

    totalMemory = mutableStateOf(0)
    freeMemory = mutableStateOf(0)
    usedMemory = mutableStateOf(0)
    memoryUsagePercent = mutableStateOf(0)
    usedMemoryHistory = mutableStateOf<HistoryData>({ items: [] })

    rx = mutableStateOf(0)
    tx = mutableStateOf(0)
    rxHistory = mutableStateOf<HistoryData>({ items: [] })
    txHistory = mutableStateOf<HistoryData>({ items: [] })

    osType = mutableStateOf<string>('')
    osRelease = mutableStateOf<string>('')
    arch = mutableStateOf<string>('')
    uptime = mutableStateOf<number>(0)
    processCount = mutableStateOf<number | null>(0)

    private disposables: (() => void)[] = []
    private get isActive() { return this.disposables.length > 0 }
    start(): Disposable {
        this.fetchCpuLoad()
        this.fetchMemory()
        this.fetchNetwork()
        this.fetchOs()

        const interval1 = setInterval(() => {
            this.fetchCpuLoad()
            this.fetchMemory()
            this.fetchOs()
        }, this.refreshRate.value)
        this.disposables.push(() => clearInterval(interval1))

        const interval2 = setInterval(() => {
            this.fetchNetwork()
        }, this.networkRefreshRate.value)
        this.disposables.push(() => clearInterval(interval2))

        return this
    }

    [Symbol.dispose]() {
        this.disposables.forEach(dispose => dispose())
        this.disposables.length = 0
    }

    incrementRefreshRate() {
        this.refreshRate.value = this.refreshRate.value + 100

        if (this.isActive) {
            this[Symbol.dispose]()
            this.start()
        }
    }

    incrementNetworkRefreshRate() {
        this.networkRefreshRate.value = this.networkRefreshRate.value + 100

        if (this.isActive) {
            this[Symbol.dispose]()
            this.start()
        }
    }

    decrementRefreshRate() {
        this.refreshRate.value = Math.max(
            100,
            this.refreshRate.value - 100
        )

        if (this.isActive) {
            this[Symbol.dispose]()
            this.start()
        }
    }

    decrementNetworkRefreshRate() {
        this.networkRefreshRate.value = Math.max(
            100,
            this.networkRefreshRate.value - 100
        )

        if (this.isActive) {
            this[Symbol.dispose]()
            this.start()
        }
    }

    private fetchCpuLoad() {
        const load = this.systemInfoRepository.cpuLoad()
        this.cpusCount.value = this.systemInfoRepository.cpusCount()
        this.cpuLoad.value = load
        this.cpuLoadHistory.value = { items: [...this.cpuLoadHistory.value.items.slice(-this.historyDataCapacity), { value: load }] }
    }

    private fetchMemory() {
        this.totalMemory.value = this.systemInfoRepository.totalMemory()
        this.freeMemory.value = this.systemInfoRepository.freeMemory()
        this.usedMemory.value = this.systemInfoRepository.usedMemory()
        this.memoryUsagePercent.value = this.systemInfoRepository.memoryUsagePercent()
        this.usedMemoryHistory.value = { items: [...this.usedMemoryHistory.value.items.slice(-this.historyDataCapacity), { value: this.memoryUsagePercent.value }] }
    }

    private fetchNetwork() {
        const { rx, tx } = this.systemInfoRepository.networkSpeed()
        this.rx.value = rx
        this.tx.value = tx
        this.rxHistory.value = { items: [...this.rxHistory.value.items.slice(-this.historyDataCapacity), { value: rx }] }
        this.txHistory.value = { items: [...this.txHistory.value.items.slice(-this.historyDataCapacity), { value: tx }] }
    }

    private fetchOs() {
        this.uptime.value = this.systemInfoRepository.uptime()
        this.processCount.value = this.systemInfoRepository.processCount()
    }
}
