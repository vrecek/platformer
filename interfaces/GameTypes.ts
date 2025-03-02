import Entity from "../Entity"
import Score from "../Score"


export type VoidFn = () => void

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
        x: number
        y: number
    }
    enemies:   Entity[]
    surfaces:  Entity[]
    scores:    Score[]
    platforms: Entity[]
}

export type LevelLoader = 'next' | 'current'