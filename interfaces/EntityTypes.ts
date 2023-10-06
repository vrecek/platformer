import Entity from "../Entity"


export type EntityStats = {
    w: number
    h: number
    x: number
    y: number
}

export type CollisionCb = (ent: Entity) => void