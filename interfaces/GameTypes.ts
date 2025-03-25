import Ammo from "../ts/entities/Ammo"
import Enemy from "../ts/entities/Enemy"
import Entity from "../ts/entities/Entity"
import Item from "../ts/entities/Item"
import Score from "../ts/entities/Score"
import WeaponItem from "../ts/entities/WeaponItem"
import Exit from "../ts/Exit"


export type VoidFn = () => void
export type Fn<T = void> = () => T

export type KeysInput = {
    pressed: boolean
    pressedKeys: string[]
}

export type CollisionValues = 'top' | 'right' | 'bottom' | 'left' | null

export type CanvasStats = {
    w: number
    h: number
}

export type Level = {
    player: {
        x: number
        y: number
    }
    image:     string
    exit:      Exit[]
    enemies:   Enemy[]
    surfaces:  Entity[]
    scores:    Score[]
    weapons:   WeaponItem[]
    ammo:      Ammo[]
    platforms: Entity[]
    items:     Item[]
}

export type EntityType = 'enemies' | 'surfaces' | 'scores' | 'platforms' | 'items' | 'weapons' | 'ammo' | 'exit'

export type LevelLoader = 'next' | 'current'

export type AudioObject = {
    audio: HTMLAudioElement
    id:    string
}