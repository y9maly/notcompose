import fs from "fs";
import path from "path";


export interface Item {
    filename: string,
    isDirectory: boolean,
    path: string,
}

export function getDirectoryContents(dirPath: string): Item[] {
    try {
        const items = fs.readdirSync(dirPath)
        const result: Item[] = []

        const parentPath = path.resolve(dirPath, '..')
        if (dirPath !== parentPath) {
            result.push({ filename: '..', isDirectory: true, path: parentPath })
        }

        for (const item of items) {
            const itemPath = path.join(dirPath, item)
            try {
                const stat = fs.statSync(itemPath)
                result.push({ filename: item, isDirectory: stat.isDirectory(), path: itemPath })
            } catch (e) {
                result.push({ filename: item, isDirectory: false, path: itemPath })
            }
        }

        return result.sort((a, b) => {
            if (a.filename === '..') return -1
            if (b.filename === '..') return 1
            if (a.isDirectory && !b.isDirectory) return -1
            if (!a.isDirectory && b.isDirectory) return 1
            return a.filename.localeCompare(b.filename)
        })
    } catch (e) {
        return []
    }
}
