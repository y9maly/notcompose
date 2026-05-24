
export interface InputSource {
    start(listener: (string: string, key: any) => void): Disposable
}
