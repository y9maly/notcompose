import {Color, colored, DrawModifier, TextCanvas} from "notcompose/terminal";
import {Modifier, mutableStateOf} from "notcompose";
import {Box} from "notcompose/layout";

interface Vec3 {
    x: number, y: number, z: number
}

function rotateX(v: Vec3, a: number) {
    const s = Math.sin(a)
    const c = Math.cos(a)

    return {
        x: v.x,
        y: v.y * c - v.z * s,
        z: v.y * s + v.z * c
    }
}

function rotateY(v: Vec3, a: number) {
    const s = Math.sin(a)
    const c = Math.cos(a)

    return {
        x: v.x * c + v.z * s,
        y: v.y,
        z: -v.x * s + v.z * c
    }
}

function project(v: Vec3, scale: number) {
    const distance = 4
    const z = 1 / (distance - v.z)

    return {
        x: v.x * z * scale,
        y: v.y * z * scale,
    }
}

const vertices = [
    {x: -1, y: -1, z: -1},
    {x: 1, y: -1, z: -1},
    {x: 1, y: 1, z: -1},
    {x: -1, y: 1, z: -1},
    {x: -1, y: -1, z: 1},
    {x: 1, y: -1, z: 1},
    {x: 1, y: 1, z: 1},
    {x: -1, y: 1, z: 1},
]

const edges: ([number, number] | [number, number, Color])[] = [
    [0, 1, Color.Green],
    [1, 2, Color.Green],
    [2, 3, Color.Green],
    [3, 0, Color.Green],

    [0, 4],
    [1, 5],
    [2, 6],
    [3, 7],

    [4, 5, Color.Red],
    [5, 6, Color.Red],
    [6, 7, Color.Red],
    [7, 4, Color.Red],
]

function drawLine(canvas: TextCanvas, x0: number, y0: number, x1: number, y1: number, color: Color | null, char = '#') {
    x0 = Math.round(x0)
    y0 = Math.round(y0)
    x1 = Math.round(x1)
    y1 = Math.round(y1)

    const dx = Math.abs(x1 - x0)
    const dy = Math.abs(y1 - y0)

    const sx = x0 < x1 ? 1 : -1
    const sy = y0 < y1 ? 1 : -1

    let err = dx - dy

    while (true) {
        canvas.drawText(x0, y0, colored(color, char))

        if (x0 === x1 && y0 === y1) {
            break
        }

        const e2 = err * 2

        if (e2 > -dy) {
            err -= dy
            x0 += sx
        }

        if (e2 < dx) {
            err += dx
            y0 += sy
        }
    }
}

const time = mutableStateOf(0)

setInterval(() => {
    time.value += 30 / 1000
}, 1000 / 30)

export function CubeScreen(
    modifier: Modifier = new Modifier(),
) {
    // Redraw отдельно от Recompose пока делать не умеем.
    // Это будет триггерить recompose->relayout->redraw каждый кадр.
    time.value

    Box(() => {}, modifier.then(
        DrawModifier(scope => {
            // Перетащить куб в центр
            scope.translate(scope.availableWidth / 2, scope.availableHeight / 2)

            // Вытянуть каждый пиксель по ширине в 2 раза.
            // Потому-что высота символа в терминале ~ в 2 раза больше ширины.
            // Иначе получится прямоугольный параллелепипед а не куб.
            scope.scale(2, 1)

            // Отрисовать следующий контент (Следующий DrawModifier в данном случае)
            scope.drawContent()
        }),

        DrawModifier(scope => {
            const scaleFactor = 1
            const scale = Math.round(Math.min(scope.availableWidth, scope.availableHeight) * scaleFactor)

            const points = vertices.map(v => {
                let p = rotateY(v, time.value)
                p = rotateX(p, time.value * 0.5)
                return project(p, scale)
            })

            for (const p of points) {
                scope.drawText(
                    Math.round(p.x),
                    Math.round(p.y),
                    '@'
                )
            }

            for (const [a, b, color] of edges) {
                const p1 = points[a]
                const p2 = points[b]
                drawLine(scope, p1.x, p1.y, p2.x, p2.y, color ?? null, '#')
            }

            // Отрисовать следующий контент (Тело Box в данном случае, оно пустое)
            scope.drawContent()
        }),
    ))
}
