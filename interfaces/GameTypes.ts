import Enemy from "../ts/entities/Enemy"
import Entity from "../ts/entities/Entity"
import Item from "../ts/entities/Item"
import Score from "../ts/entities/Score"


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
    enemies:   Enemy[]
    surfaces:  Entity[]
    scores:    Score[]
    platforms: Entity[]
    items:     Item[]
}

export type EntityType = 'enemies' | 'surfaces' | 'scores' | 'platforms' | 'items'

export type LevelLoader = 'next' | 'current'