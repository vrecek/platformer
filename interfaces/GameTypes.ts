import Entity from "../Entity"
import Player from "../Player"

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