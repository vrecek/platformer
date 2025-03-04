import Entity from "../Entity"
import Item from "../Item"
import Score from "../Score"


export type VoidFn = () => void
export type Fn<T = void> = () => T

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
    items:     Item[]
}

export type LevelLoader = 'next' | 'current'