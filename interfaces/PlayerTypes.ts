import Item from "../ts/entities/Item"
import { EntityStats } from "./EntityTypes"

export type MoveKeys = 'w' | 'a' | 's' | 'd'

export type Bind = {
    keys: string[]
    fn:   () => void
}

export type Bindings = {
    [key:string]: Bind
}

export type PlayerStats = ActionStats & {
    speed:      number
    jump_power: number
}

export type ActionStats = EntityStats & {
    health:     number
    def_health: number
}

export type PlayerEq = (Item | null)[]

export type ActivationObject = {
    init_jump:   number
    init_speed:  number
    init_attcd:  number
    init_attdmg: number
    init_bltspd: number
}