import Ammo from "../ts/entities/Ammo"
import Enemy from "../ts/entities/Enemy"
import Entity from "../ts/entities/Entity"
import Item from "../ts/entities/Item"
import Obstacle from "../ts/entities/Obstacle"
import Score from "../ts/entities/Score"
import WeaponItem from "../ts/entities/WeaponItem"
import Exit from "../ts/Exit"


export type VoidFn = () => void
export type Fn<T = void> = () => T

export type KeysInput = {
    activeKeys: string[]
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
    obstacles: Obstacle[]
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
    path:  string
    id:    string
}

export type GameFunctions = {
    fn: VoidFn
    id: string
}

export type GameTimeouts = {
    fn:       VoidFn
    id:       string
    timer:    number
    timeleft: number
    start:    number
}

export type GameDates = {
    id:        string
    val:       number
    holdStart: number
}

export type Achievement = {
    id:        string
    img:       string
    txt:       string
    title:     string
    type:      string
    pred:      (...args: any) => boolean
    unlocked?: boolean
}