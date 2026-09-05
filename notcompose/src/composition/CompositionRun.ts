import type { CompositionSession } from './CompositionSession.js'

export interface CompositionRun {
    debugInformation?: string
    session: CompositionSession
}
