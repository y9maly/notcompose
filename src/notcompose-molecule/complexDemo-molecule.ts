import {
    ActivityFeedItemVm,
    ActivityFeedVm,
    AssigneeBadgeVm,
    Comment,
    CommentPreviewVm,
    DashboardContentVm,
    DashboardVm,
    HeaderVm,
    Project,
    ProjectDashboardVm,
    ProjectPickerItemVm,
    ProjectPickerVm,
    Task,
    TaskListVm,
    TaskRowVm,
    buildTaskActions,
    commentsByTaskSubject,
    currentUserSubject,
    formatPriority,
    formatTaskStatus,
    presencesSubject,
    priorityWeight,
    projectsSubject,
    searchQuerySubject,
    selectedProjectIdSubject,
    sortModeSubject,
    tasksByProjectSubject,
    usersSubject,
} from './complexDemo'
import {subjectMolecule} from "./rxjs/subjectMolecule";
import {subjectAsState} from "../notcompose/runtime-rxjs/subjectAsState";
import {Key} from "../notcompose/runtime-highlevel/Key";
import {rememberState} from "../notcompose/runtime-highlevel/rememberState";

export const dashboardVm = subjectMolecule<DashboardVm>(() => {
    return {
        header: HeaderVmComponent(),
        projectPicker: ProjectPickerVmComponent(),
        content: DashboardContentVmComponent(),
    }
})

function HeaderVmComponent(): HeaderVm {
    const currentUser = subjectAsState(currentUserSubject)
    const projects = subjectAsState(projectsSubject)

    const user = currentUser.value
    const activeProjects = projects.value.filter(project => !project.archived)

    return {
        title: 'Project Dashboard',
        subtitle: `${activeProjects.length} active projects`,
        userLabel: user ? `Signed in as ${user.username}` : 'Anonymous',
        canCreateProject: user?.role === 'admin' || user?.role === 'manager',
    }
}

function ProjectPickerVmComponent(): ProjectPickerVm {
    const projects = subjectAsState(projectsSubject)
    const selectedProjectId = subjectAsState(selectedProjectIdSubject)

    return {
        selectedProjectId: selectedProjectId.value,
        projects: projects.value.map(project => {
            return ProjectPickerItemVmComponent(project, selectedProjectId.value)
        }),
    }
}

function ProjectPickerItemVmComponent(
    project: Project,
    selectedProjectId: string | null,
): ProjectPickerItemVm {
    return {
        id: project.id,
        label: project.archived ? `${project.name} archived` : project.name,
        selected: project.id === selectedProjectId,
        disabled: project.archived,
    }
}

function DashboardContentVmComponent(): DashboardContentVm {
    const projects = subjectAsState(projectsSubject)
    const selectedProjectId = subjectAsState(selectedProjectIdSubject)

    const selectedProject = projects.value.find(project => {
        return project.id === selectedProjectId.value
    })

    if (!selectedProject) {
        return {
            type: 'empty',
            message: 'Select a project',
        }
    }

    return ProjectDashboardVmComponent(selectedProject)
}

function ProjectDashboardVmComponent(project: Project): ProjectDashboardVm {
    const currentUser = subjectAsState(currentUserSubject)

    const user = currentUser.value
    const canEditProject = user?.role === 'admin' || user?.role === 'manager'

    return {
        type: 'project',
        projectId: project.id,
        projectName: project.name,
        canEditProject,
        taskList: TaskListVmComponent(project.id, canEditProject),
        activityFeed: ActivityFeedVmComponent(project.id),
    }
}

function TaskListVmComponent(
    projectId: string,
    canEditProject: boolean,
): TaskListVm {
    const tasks = subjectAsState(tasksByProjectSubject(projectId))
    const searchQuery = subjectAsState(searchQuerySubject)
    const sortMode = subjectAsState(sortModeSubject)

    const normalizedQuery = searchQuery.value.trim().toLowerCase()

    const filteredTasks = tasks.value.filter(task => {
        if (!normalizedQuery) return true
        return task.title.toLowerCase().includes(normalizedQuery)
    })

    const sortedTasks = [...filteredTasks].sort((a, b) => {
        if (sortMode.value === 'updated') {
            return b.updatedAt - a.updatedAt
        }

        return priorityWeight(b.priority) - priorityWeight(a.priority)
    })

    const done = filteredTasks.filter(task => task.status === 'done').length

    return {
        title: 'Tasks in project',
        total: tasks.value.length,
        visible: filteredTasks.length,
        done,
        rows: sortedTasks.map(task => {
            return Key(task.id, () => {
                return TaskRowVmComponent(task, canEditProject)
            })
        }),
    }
}

function TaskRowVmComponent(
    task: Task,
    canEditProject: boolean,
): TaskRowVm {
    const expanded = rememberState(() => false)
    const comments = subjectAsState(commentsByTaskSubject(task.id))

    const previewComments = expanded.value
        ? comments.value.slice(0, 3).map(CommentPreviewVmComponent)
        : []

    return {
        id: task.id,
        title: task.title,
        statusLabel: formatTaskStatus(task.status),
        priorityLabel: formatPriority(task.priority),
        assignee: AssigneeBadgeVmComponent(task.assigneeId),
        commentCount: comments.value.length,
        expanded: expanded.value,
        previewComments,
        actions: buildTaskActions(task, canEditProject),
    }
}

function AssigneeBadgeVmComponent(assigneeId: string | null): AssigneeBadgeVm {
    const users = subjectAsState(usersSubject)
    const presences = subjectAsState(presencesSubject)

    if (!assigneeId) {
        return {
            label: 'Unassigned',
            online: false,
            muted: true,
        }
    }

    const user = users.value.find(user => user.id === assigneeId)
    const presence = presences.value.find(presence => presence.userId === assigneeId)

    return {
        label: user?.username ?? 'Unknown user',
        online: presence?.online ?? false,
        muted: false,
    }
}

function CommentPreviewVmComponent(comment: Comment): CommentPreviewVm {
    const users = subjectAsState(usersSubject)
    const author = users.value.find(user => user.id === comment.authorId)

    return {
        id: comment.id,
        author: author?.username ?? 'Unknown user',
        text: comment.text.length > 80
            ? `${comment.text.slice(0, 80)}...`
            : comment.text,
    }
}

function ActivityFeedVmComponent(projectId: string): ActivityFeedVm {
    const tasks = subjectAsState(tasksByProjectSubject(projectId))
    const users = subjectAsState(usersSubject)

    const latestTasks = [...tasks.value]
        .sort((a, b) => b.updatedAt - a.updatedAt)
        .slice(0, 5)

    return {
        title: 'Recent activity',
        items: latestTasks.map(task => {
            const assignee = users.value.find(user => user.id === task.assigneeId)

            return {
                id: task.id,
                text: `${task.title} updated, assigned to ${assignee?.username ?? 'nobody'}`,
            } satisfies ActivityFeedItemVm
        }),
    }
}

// Example usage:
dashboardVm.subscribe(vm => {
    console.log(JSON.stringify(vm, null, 2))
})
