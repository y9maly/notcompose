import { BehaviorSubject, combineLatest, distinctUntilChanged, map, Observable, of, shareReplay, switchMap } from 'rxjs'
import { ActivityFeedVm, AssigneeBadgeVm, buildTaskActions, CommentPreviewVm, commentsByTaskSubject, currentUserSubject, DashboardContentVm, DashboardVm, formatPriority, formatTaskStatus, HeaderVm, Presence, presencesSubject, priorityWeight, Project, ProjectDashboardVm, ProjectPickerVm, projectsSubject, searchQuerySubject, selectedProjectIdSubject, shallowEqual, sortModeSubject, Task, TaskListVm, TaskRowVm, tasksByProjectSubject, User, usersSubject, } from './complexDemo.js'

const currentUser$ = currentUserSubject.asObservable()
const users$ = usersSubject.asObservable()
const projects$ = projectsSubject.asObservable()
const selectedProjectId$ = selectedProjectIdSubject.asObservable()
const searchQuery$ = searchQuerySubject.asObservable()
const sortMode$ = sortModeSubject.asObservable()
const presences$ = presencesSubject.asObservable()

const expandedTaskIdsSubject = new BehaviorSubject<Set<string>>(new Set())

export function toggleTaskExpanded(taskId: string): void {
    const current = expandedTaskIdsSubject.value
    const next = new Set(current)

    if (next.has(taskId)) {
        next.delete(taskId)
    } else {
        next.add(taskId)
    }

    expandedTaskIdsSubject.next(next)
}

const header$: Observable<HeaderVm> = combineLatest([
    currentUser$,
    projects$,
]).pipe(
    map(([currentUser, projects]): HeaderVm => {
        const activeProjects = projects.filter(project => !project.archived)

        return {
            title: 'Project Dashboard',
            subtitle: `${activeProjects.length} active projects`,
            userLabel: currentUser
                ? `Signed in as ${currentUser.username}`
                : 'Anonymous',
            canCreateProject:
                currentUser?.role === 'admin'
                || currentUser?.role === 'manager',
        }
    }),
    distinctUntilChanged(shallowEqual),
    shareReplay({ bufferSize: 1, refCount: true }),
)

const projectPicker$: Observable<ProjectPickerVm> = combineLatest([
    projects$,
    selectedProjectId$,
]).pipe(
    map(([projects, selectedProjectId]): ProjectPickerVm => {
        return {
            selectedProjectId,
            projects: projects.map(project => {
                return {
                    id: project.id,
                    label: project.archived
                        ? `${project.name} archived`
                        : project.name,
                    selected: project.id === selectedProjectId,
                    disabled: project.archived,
                }
            }),
        }
    }),
    distinctUntilChanged(shallowEqual),
    shareReplay({ bufferSize: 1, refCount: true }),
)

const selectedProject$: Observable<Project | null> = combineLatest([
    projects$,
    selectedProjectId$,
]).pipe(
    map(([projects, selectedProjectId]) => {
        return projects.find(project => project.id === selectedProjectId) ?? null
    }),
    distinctUntilChanged((a, b) => a?.id === b?.id),
    shareReplay({ bufferSize: 1, refCount: true }),
)

const dashboardContent$: Observable<DashboardContentVm> = selectedProject$.pipe(
    switchMap(project => {
        if (!project) {
            return of<DashboardContentVm>({
                type: 'empty',
                message: 'Select a project',
            })
        }

        return projectDashboardVm$(project)
    }),
    shareReplay({ bufferSize: 1, refCount: true }),
)

function projectDashboardVm$(project: Project): Observable<ProjectDashboardVm> {
    const canEditProject$ = currentUser$.pipe(
        map(user => user?.role === 'admin' || user?.role === 'manager'),
        distinctUntilChanged(),
        shareReplay({ bufferSize: 1, refCount: true }),
    )

    return combineLatest([
        canEditProject$,
        taskListVm$(project.id, canEditProject$),
        activityFeedVm$(project.id),
    ]).pipe(
        map(([canEditProject, taskList, activityFeed]): ProjectDashboardVm => {
            return {
                type: 'project',
                projectId: project.id,
                projectName: project.name,
                canEditProject,
                taskList,
                activityFeed,
            }
        }),
        distinctUntilChanged(shallowEqual),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
}

function taskListVm$(
    projectId: string,
    canEditProject$: Observable<boolean>,
): Observable<TaskListVm> {
    const tasks$ = tasksByProjectSubject(projectId).asObservable()

    return combineLatest([
        tasks$,
        searchQuery$,
        sortMode$,
        canEditProject$,
    ]).pipe(
        switchMap(([tasks, searchQuery, sortMode, canEditProject]) => {
            const normalizedQuery = searchQuery.trim().toLowerCase()

            const filteredTasks = tasks.filter(task => {
                if (!normalizedQuery) return true
                return task.title.toLowerCase().includes(normalizedQuery)
            })

            const sortedTasks = [...filteredTasks].sort((a, b) => {
                if (sortMode === 'updated') {
                    return b.updatedAt - a.updatedAt
                }

                return priorityWeight(b.priority) - priorityWeight(a.priority)
            })

            const done = filteredTasks.filter(task => task.status === 'done').length
            const rows$ = sortedTasks.map(task => taskRowVm$(task, canEditProject))

            if (rows$.length === 0) {
                return of<TaskListVm>({
                    title: 'Tasks in project',
                    total: tasks.length,
                    visible: filteredTasks.length,
                    done,
                    rows: [],
                })
            }

            return combineLatest(rows$).pipe(
                map((rows): TaskListVm => {
                    return {
                        title: 'Tasks in project',
                        total: tasks.length,
                        visible: filteredTasks.length,
                        done,
                        rows,
                    }
                }),
            )
        }),
        distinctUntilChanged(shallowEqual),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
}

function taskRowVm$(
    task: Task,
    canEditProject: boolean,
): Observable<TaskRowVm> {
    const comments$ = commentsByTaskSubject(task.id).asObservable()

    const expanded$ = expandedTaskIdsSubject.pipe(
        map(ids => ids.has(task.id)),
        distinctUntilChanged(),
    )

    return combineLatest([
        comments$,
        users$,
        presences$,
        expanded$,
    ]).pipe(
        map(([comments, users, presences, expanded]): TaskRowVm => {
            const previewComments: CommentPreviewVm[] = expanded
                ? comments.slice(0, 3).map(comment => {
                    const author = users.find(user => user.id === comment.authorId)

                    return {
                        id: comment.id,
                        author: author?.username ?? 'Unknown user',
                        text: comment.text.length > 80
                            ? `${comment.text.slice(0, 80)}...`
                            : comment.text,
                    }
                })
                : []

            return {
                id: task.id,
                title: task.title,
                statusLabel: formatTaskStatus(task.status),
                priorityLabel: formatPriority(task.priority),
                assignee: buildAssigneeBadge(task.assigneeId, users, presences),
                commentCount: comments.length,
                expanded,
                previewComments,
                actions: buildTaskActions(task, canEditProject),
            }
        }),
        distinctUntilChanged(shallowEqual),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
}

function buildAssigneeBadge(
    assigneeId: string | null,
    users: User[],
    presences: Presence[],
): AssigneeBadgeVm {
    if (!assigneeId) {
        return {
            label: 'Unassigned',
            online: false,
            muted: true,
        }
    }

    const user = users.find(user => user.id === assigneeId)
    const presence = presences.find(presence => presence.userId === assigneeId)

    return {
        label: user?.username ?? 'Unknown user',
        online: presence?.online ?? false,
        muted: false,
    }
}

function activityFeedVm$(projectId: string): Observable<ActivityFeedVm> {
    const tasks$ = tasksByProjectSubject(projectId).asObservable()

    return combineLatest([
        tasks$,
        users$,
    ]).pipe(
        map(([tasks, users]): ActivityFeedVm => {
            const latestTasks = [...tasks]
                .sort((a, b) => b.updatedAt - a.updatedAt)
                .slice(0, 5)

            return {
                title: 'Recent activity',
                items: latestTasks.map(task => {
                    const assignee = users.find(user => user.id === task.assigneeId)

                    return {
                        id: task.id,
                        text: `${task.title} updated, assigned to ${assignee?.username ?? 'nobody'}`,
                    }
                }),
            }
        }),
        distinctUntilChanged(shallowEqual),
        shareReplay({ bufferSize: 1, refCount: true }),
    )
}

export const dashboardVm$: Observable<DashboardVm> = combineLatest([
    header$,
    projectPicker$,
    dashboardContent$,
]).pipe(
    map(([header, projectPicker, content]): DashboardVm => {
        return {
            header,
            projectPicker,
            content,
        }
    }),
    distinctUntilChanged(shallowEqual),
    shareReplay({ bufferSize: 1, refCount: true }),
)

// Example usage:
dashboardVm$.subscribe(vm => {
    console.log(JSON.stringify(vm, null, 2))
})
