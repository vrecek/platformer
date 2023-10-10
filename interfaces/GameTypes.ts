import Entity from "../Entity"


export type VoidFn
 = () => void

export type KeysInput = {
    pressed: boolean
    pressedKeys: string[]
}

export type CanvasStats = {
    w: number
    h: number
}

export type Level = {
    player: {
        x: number,
        y: number
    }
    enemies: Entity[]
    surfaces: Entity[]
    scores: Entity[]
}

export type LevelLoader = 'next' | 'current'