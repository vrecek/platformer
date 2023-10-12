import Entity from "../Entity"


export type EntityStats = {
    id: string
    w: number
    h: number
    x: number
    y: number
}

export type CollisionCb = (ent: Entity) => void

export type AnimationObject = AnimationArg & {
    shouldMove: boolean
    moveLevel: number
}

export type AnimationPath = {
    x: number
    y: number
}

export type AnimationArg = {
    speed: number
    paths: AnimationPath[]
}