import { BehaviorSubject } from 'rxjs'


// Реализация с использованием RxJs лежит в файле complexDemo-rxjs.ts

// Реализация с использованием notcompose-molecule лежит в файле complexDemo-molecule.ts


export interface User {
    id: string
    username: string
    role: 'admin' | 'manager' | 'developer' | 'guest'
}

export interface Project {
    id: string
    name: string
    archived: boolean
}

export interface Task {
    id: string
    projectId: string
    title: string
    status: 'todo' | 'in_progress' | 'done'
    priority: 'low' | 'medium' | 'high'
    assigneeId: string | null
    updatedAt: number
}

export interface Comment {
    id: string
    taskId: string
    authorId: string
    text: string
    createdAt: number
}

export interface Presence {
    userId: string
    online: boolean
    lastSeenAt: number
}

export type SortMode = 'priority' | 'updated'

export interface DashboardVm {
    header: HeaderVm
    projectPicker: ProjectPickerVm
    content: DashboardContentVm
}

export interface HeaderVm {
    title: string
    subtitle: string
    userLabel: string
    canCreateProject: boolean
}

export interface ProjectPickerVm {
    selectedProjectId: string | null
    projects: ProjectPickerItemVm[]
}

export interface ProjectPickerItemVm {
    id: string
    label: string
    selected: boolean
    disabled: boolean
}

export type DashboardContentVm = EmptyDashboardVm | ProjectDashboardVm

export interface EmptyDashboardVm {
    type: 'empty'
    message: string
}

export interface ProjectDashboardVm {
    type: 'project'
    projectId: string
    projectName: string
    canEditProject: boolean
    taskList: TaskListVm
    activityFeed: ActivityFeedVm
}

export interface TaskListVm {
    title: string
    total: number
    visible: number
    done: number
    rows: TaskRowVm[]
}

export interface TaskRowVm {
    id: string
    title: string
    statusLabel: string
    priorityLabel: string
    assignee: AssigneeBadgeVm
    commentCount: number
    expanded: boolean
    previewComments: CommentPreviewVm[]
    actions: TaskActionVm[]
}

export interface AssigneeBadgeVm {
    label: string
    online: boolean
    muted: boolean
}

export interface CommentPreviewVm {
    id: string
    author: string
    text: string
}

export interface TaskActionVm {
    id: 'start' | 'complete' | 'reopen'
    label: string
    enabled: boolean
}

export interface ActivityFeedVm {
    title: string
    items: ActivityFeedItemVm[]
}

export interface ActivityFeedItemVm {
    id: string
    text: string
}

export const currentUserSubject = new BehaviorSubject<User | null>({
    id: 'u1',
    username: 'alice',
    role: 'manager',
})

export const usersSubject = new BehaviorSubject<User[]>([
    { id: 'u1', username: 'alice', role: 'manager' },
    { id: 'u2', username: 'bob', role: 'developer' },
    { id: 'u3', username: 'charlie', role: 'developer' },
])

export const projectsSubject = new BehaviorSubject<Project[]>([
    { id: 'p1', name: 'Billing', archived: false },
    { id: 'p2', name: 'Terminal UI', archived: false },
    { id: 'p3', name: 'Legacy Admin', archived: true },
])

export const selectedProjectIdSubject = new BehaviorSubject<string | null>('p1')
export const searchQuerySubject = new BehaviorSubject<string>('')
export const sortModeSubject = new BehaviorSubject<SortMode>('priority')

export const presencesSubject = new BehaviorSubject<Presence[]>([
    { userId: 'u1', online: true, lastSeenAt: Date.now() },
    { userId: 'u2', online: false, lastSeenAt: Date.now() - 10_000 },
    { userId: 'u3', online: true, lastSeenAt: Date.now() },
])

const tasksByProject = new Map<string, BehaviorSubject<Task[]>>([
    [
        'p1',
        new BehaviorSubject<Task[]>([
            {
                id: 't1',
                projectId: 'p1',
                title: 'Add Stripe invoice sync',
                status: 'todo',
                priority: 'high',
                assigneeId: 'u2',
                updatedAt: Date.now() - 1_000,
            },
            {
                id: 't2',
                projectId: 'p1',
                title: 'Fix trial expiration edge case',
                status: 'in_progress',
                priority: 'medium',
                assigneeId: 'u3',
                updatedAt: Date.now() - 3_000,
            },
            {
                id: 't3',
                projectId: 'p1',
                title: 'Remove deprecated coupon flow',
                status: 'done',
                priority: 'low',
                assigneeId: null,
                updatedAt: Date.now() - 9_000,
            },
        ]),
    ],
    [
        'p2',
        new BehaviorSubject<Task[]>([
            {
                id: 't4',
                projectId: 'p2',
                title: 'Implement focus traversal',
                status: 'in_progress',
                priority: 'high',
                assigneeId: 'u1',
                updatedAt: Date.now() - 2_000,
            },
        ]),
    ],
])

const commentsByTask = new Map<string, BehaviorSubject<Comment[]>>([
    [
        't1',
        new BehaviorSubject<Comment[]>([
            {
                id: 'c1',
                taskId: 't1',
                authorId: 'u1',
                text: 'Please make sure we handle failed webhook retries.',
                createdAt: Date.now() - 5_000,
            },
            {
                id: 'c2',
                taskId: 't1',
                authorId: 'u2',
                text: 'I will add idempotency keys before merging.',
                createdAt: Date.now() - 4_000,
            },
        ]),
    ],
    [
        't2',
        new BehaviorSubject<Comment[]>([
            {
                id: 'c3',
                taskId: 't2',
                authorId: 'u3',
                text: 'This reproduces only when account timezone changes during trial.',
                createdAt: Date.now() - 6_000,
            },
        ]),
    ],
])

export function tasksByProjectSubject(projectId: string): BehaviorSubject<Task[]> {
    let subject = tasksByProject.get(projectId)

    if (!subject) {
        subject = new BehaviorSubject<Task[]>([])
        tasksByProject.set(projectId, subject)
    }

    return subject
}

export function commentsByTaskSubject(taskId: string): BehaviorSubject<Comment[]> {
    let subject = commentsByTask.get(taskId)

    if (!subject) {
        subject = new BehaviorSubject<Comment[]>([])
        commentsByTask.set(taskId, subject)
    }

    return subject
}

export function priorityWeight(priority: Task['priority']): number {
    switch (priority) {
        case 'high':
            return 3
        case 'medium':
            return 2
        case 'low':
            return 1
    }
}

export function formatTaskStatus(status: Task['status']): string {
    switch (status) {
        case 'todo':
            return 'To do'
        case 'in_progress':
            return 'In progress'
        case 'done':
            return 'Done'
    }
}

export function formatPriority(priority: Task['priority']): string {
    switch (priority) {
        case 'low':
            return 'Low'
        case 'medium':
            return 'Medium'
        case 'high':
            return 'High'
    }
}

export function buildTaskActions(
    task: Task,
    canEditProject: boolean,
): TaskActionVm[] {
    if (!canEditProject) return []

    if (task.status === 'todo') {
        return [{ id: 'start', label: 'Start', enabled: true }]
    }

    if (task.status === 'in_progress') {
        return [{ id: 'complete', label: 'Complete', enabled: true }]
    }

    return [{ id: 'reopen', label: 'Reopen', enabled: true }]
}

export function shallowEqual<T>(a: unknown, b: unknown): boolean {
    return JSON.stringify(a) === JSON.stringify(b)
}
