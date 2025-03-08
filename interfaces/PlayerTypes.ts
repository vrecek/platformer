import Item from "../ts/entities/Item"
import { EntityStats } from "./EntityTypes"

export type MoveKeys = 'w' | 'a' | 's' | 'd'

export type PlayerPos = {
    x: number
    y: number
}

export type Bind = {
    keys: string[]
    fn:   () => void
}

export type Bindings = {
    [key:string]: Bind
}

export type PlayerStats = EntityStats& {
    speed:      number
    jump_power: number
}

export type PlayerEq = (Item | null)[]