import Entity from "../Entity"


export type OptionalArgs = {
    name?:     Maybe
    color?:    Maybe
    image?:    Maybe
    animPath?: AnimationArg
}

export type EntityStats = {
    id:   string
    name: Maybe
    anim: Maybe<AnimationObject>
    w:    number
    h:    number
    x:    number
    y:    number
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
} | null

export type Maybe<T = string> = T | null | undefined