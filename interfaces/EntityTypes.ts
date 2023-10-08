import Entity from "../Entity"


export type EntityStats = {
    id: string
    w: number
    h: number
    x: number
    y: number
}

export type CollisionCb = (ent: Entity) => void