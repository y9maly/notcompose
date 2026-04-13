import {execSync} from "node:child_process";
import * as os from "node:os";
import fs from "fs";


export interface SystemInfoRepository {
    cpusCount(): number
    cpuLoad(): number

    totalMemory(): number
    freeMemory(): number
    usedMemory(): number
    memoryUsagePercent(): number

    networkSpeed(): { rx: number; tx: number }

    uptime(): number

    arch(): string
    homedir(): string
    hostname(): string
    osType(): string
    osVersion(): string
    osRelease(): string
    username(): string
    processCount(): number | null
}

type NetSnapshot = {
    rx: number
    tx: number
    timestamp: number
}

export class FakeSystemInfoRepository implements SystemInfoRepository {
    cpusCount(): number {
        return 12
    }

    cpuLoad(): number {
        return Math.floor(Math.random() * 101)
    }

    totalMemory(): number {
        return 24 * 1024 * 1024 * 1024
    }

    freeMemory(): number {
        return Math.floor(Math.random() * 2 * 1024 * 1024 * 1024)
    }

    usedMemory(): number {
        return Math.floor(Math.random() * 24 * 1024 * 1024 * 1024)
    }

    memoryUsagePercent(): number {
        return Math.floor(Math.random() * 101)
    }

    networkSpeed(): { rx: number; tx: number; } {
        return {
            rx: Math.floor(Math.random() * 10 * 1024 * 1024),
            tx: Math.floor(Math.random() * 10 * 1024 * 1024),
        }
    }

    uptime(): number {
        return Math.floor(Math.random() * 1000)
    }

    arch(): string {
        return `arm64`
    }

    homedir(): string {
        return `/Users/idk`
    }

    hostname(): string {
        return `idk.local`
    }

    osType(): string {
        return `Linux`
    }

    osVersion(): string {
        return `Android 12.1`
    }

    osRelease(): string {
        return '42'
    }

    username(): string {
        return `idk`
    }

    processCount(): number | null {
        return Math.floor(Math.random() * 700)
    }
}

// нагенерно
export class NodejsSystemInfoRepository implements SystemInfoRepository {
    private lastCpuInfo: os.CpuInfo[] | null = null
    private lastNet: NetSnapshot | null = null

    cpusCount(): number {
        return os.cpus().length
    }

    cpuLoad(): number {
        const currentCpuInfo = os.cpus()

        if (!this.lastCpuInfo) {
            this.lastCpuInfo = currentCpuInfo
            return 0
        }

        let idleDiff = 0
        let totalDiff = 0

        for (let i = 0; i < currentCpuInfo.length; i++) {
            const prev = this.lastCpuInfo[i].times
            const curr = currentCpuInfo[i].times

            const prevTotal = prev.user + prev.nice + prev.sys + prev.idle + prev.irq
            const currTotal = curr.user + curr.nice + curr.sys + curr.idle + curr.irq

            idleDiff += curr.idle - prev.idle
            totalDiff += currTotal - prevTotal
        }

        this.lastCpuInfo = currentCpuInfo

        if (totalDiff === 0) return 0

        return Math.round(100 - (idleDiff / totalDiff) * 100)
    }

    // ---- MEMORY ----

    totalMemory(): number {
        return os.totalmem()
    }

    freeMemory(): number {
        return os.freemem()
    }

    usedMemory(): number {
        return this.totalMemory() - this.freeMemory()
    }

    memoryUsagePercent(): number {
        return Math.round(
            (this.usedMemory() / this.totalMemory()) * 100
        )
    }

    networkSpeed(): { rx: number; tx: number } {
        const now = Date.now()
        const { rx, tx } = this.readNetworkBytes()

        if (!this.lastNet) {
            this.lastNet = { rx, tx, timestamp: now }
            return { rx: 0, tx: 0 }
        }

        const timeDiffMs = now - this.lastNet.timestamp

        if (timeDiffMs <= 0) {
            return { rx: 0, tx: 0 }
        }

        const timeDiffSec = timeDiffMs / 1000

        const rxRate = (rx - this.lastNet.rx) / timeDiffSec
        const txRate = (tx - this.lastNet.tx) / timeDiffSec

        this.lastNet = { rx, tx, timestamp: now }

        return {
            rx: Math.max(0, Math.round(rxRate)),
            tx: Math.max(0, Math.round(txRate)),
        }
    }

    // ---- SYSTEM ----

    uptime(): number {
        return os.uptime() // секунды
    }

    // ---- PROCESSES ----

    arch(): string {
        return os.arch()
    }

    homedir(): string {
        return os.homedir()
    }

    hostname(): string {
        return os.hostname()
    }

    osType(): string {
        return os.type()
    }

    osVersion(): string {
        return os.version()
    }

    osRelease(): string {
        return os.release()
    }

    username(): string {
        return os.userInfo().username
    }

    processCount(): number | null {
        try {
            // Linux / macOS
            const result = execSync('ps -e | wc -l')
                .toString()
                .trim()
            return parseInt(result)
        } catch {
            return null
        }
    }

    private readNetworkBytes(): { rx: number; tx: number } {
        try {
            // Linux fast path
            const data = fs.readFileSync('/proc/net/dev', 'utf-8')

            let rx = 0
            let tx = 0

            const lines = data.split('\n').slice(2)

            for (const line of lines) {
                const parts = line.trim().split(/\s+/)
                if (parts.length < 17) continue

                rx += parseInt(parts[1], 10)
                tx += parseInt(parts[9], 10)
            }

            return { rx, tx }
        } catch {
            // macOS fallback
            try {
                const output = execSync('netstat -ib').toString()

                let rx = 0
                let tx = 0

                const lines = output.split('\n').slice(1)

                for (const line of lines) {
                    const parts = line.trim().split(/\s+/)
                    if (parts.length < 10) continue

                    const ibytes = parseInt(parts[6], 10)
                    const obytes = parseInt(parts[9], 10)

                    if (!isNaN(ibytes)) rx += ibytes
                    if (!isNaN(obytes)) tx += obytes
                }

                return { rx, tx }
            } catch {
                return { rx: 0, tx: 0 }
            }
        }
    }
}
