import { defineConfig, TestProjectConfiguration } from 'vitest/config'

const testProject_notcompose: TestProjectConfiguration = {
    root: 'notcompose',
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts'],
        isolate: true,
        // pool: 'forks', todo idk
    }
}

const testProject_notcomposeLayout: TestProjectConfiguration = {
    root: 'notcompose-layout',
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts'],
        isolate: true,
        // pool: 'forks', todo idk
    }
}

const testProject_notcomposeUi: TestProjectConfiguration = {
    root: 'notcompose-ui',
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts'],
        isolate: true,
        // pool: 'forks', todo idk
    }
}

const testProject_notcomposeTerminal: TestProjectConfiguration = {
    root: 'notcompose-terminal',
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts'],
        isolate: true,
        // pool: 'forks', todo idk
    }
}

const testProject_notcomposeMolecule: TestProjectConfiguration = {
    root: 'notcompose-molecule',
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts'],
        isolate: true,
        // pool: 'forks', todo idk
    }
}

const testProject_notcomposeHtml: TestProjectConfiguration = {
    root: 'notcompose-html',
    test: {
        environment: 'happy-dom',
        globals: true,
        include: ['test/**/*.test.ts'],
        isolate: true,
        // pool: 'forks', todo idk
    }
}

const testProject_root: TestProjectConfiguration = {
    root: '.',
    test: {
        environment: 'node',
        globals: true,
        include: ['test/**/*.test.ts'],
        isolate: true,
        // pool: 'forks', todo idk
    }
}

export default defineConfig({
    resolve: { tsconfigPaths: true, },

    test: {
        projects: [
            testProject_notcompose,
            testProject_notcomposeLayout,
            testProject_notcomposeUi,
            testProject_notcomposeTerminal,
            testProject_notcomposeMolecule,
            testProject_notcomposeHtml,
            testProject_root,
        ]
    },
})
