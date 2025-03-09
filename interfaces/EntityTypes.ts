import Entity from "../ts/entities/Entity"


export type OptionalArgs = {
    name?:         Maybe
    color?:        Maybe
    image?:        Maybe
    animPath?:     Maybe<AnimationArg>
    act_defaults?: Maybe<ActionDefaults> 
}

export type ShootDirection = 'left' | 'right'

export type OptionalEnemyArgs = OptionalArgs & {
    shoot?: boolean
}

export type EntityPos = {
    x: number
    y: number
}

export type ActionDefaults = {
    shoot_cd?:     number
    bullet_dmg?:   number
    bullet_speed?: number
    health?:       number
    direction?:    ShootDirection
}

export type EntityStats = {
    id:   string
    name: Maybe
    img:  Maybe
    anim: Maybe<AnimationObject>
    w:    number
    h:    number
    x:    number
    y:    number
}

export type CollisionCb<T extends Entity = Entity> = (ent: T) => void

export type AnimationObject = AnimationArg & {
    shouldMove: boolean
    moveLevel:  number
}

export type PathObj = {
    x: number
    y: number
}

export type AnimationArg = {
    speed:          number
    paths:          Path[]
    interval_wait?: number
} | null

export type Path = [number, number]

export type Maybe<T = string> = T | null | undefined

export type Effects = Items | Platforms

export type Platforms = 'speed' | 'jump'
export type Items = 'jump' | 'speed' | 'jumpboost' | 'invincibility' | 'attackspeed' | 'attackdmg'

export type Pos = {
    x: number
    y: number
    w: number
    h: number
}

export type Bullet = {
    obj: Entity
    dir: BulletDirection
}

export type BulletDirection = 1 | -1

export type HealthObject = {
    default: number
    current: number
}