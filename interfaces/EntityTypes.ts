import Entity from "../ts/entities/Entity"
import Game from "../ts/Game"


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

export type OptionalActionArgs = OptionalArgs & {
    godmode?: boolean
    game?:    Maybe<Game>
}

export type EntityPos = {
    x: number
    y: number
}

export type ActionDefaults = {
    weapon?:    Weapon
    game?:      Game
    health?:    number
    direction?: ShootDirection
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
    obj:       Entity
    type:      BulletType
    dir:       BulletDirection
    dirX:      number
    dirY:      number
    //rad?:number,ang?:number
    explosionObj?: ExplosionBulletObject
}

export type ExplosionBulletObject = {
    sizeStep: number
    affected: string[]
    timeout?: number
}

export type BulletType = 'regular' | 'explosive' | 'explosion'

export type BulletDirection = 1 | -1

export type HealthObject = {
    default: number
    current: number
}

export type Weapon = {
    type:         WeaponType
    is_reloading: boolean
    inf_ammo:     boolean
    stats:        WeaponCommon | ShotgunWeapon
    img:          string
    wav:          string
}

export type WeaponCommon = {
    [key in WeaponStat]: number
}

export type PistolWeapon = WeaponCommon & {

}

export type ShotgunWeapon = WeaponCommon & {
    angle_start: number
    angle_step:  number
    bullet_nr:   number
}

export type WeaponStats = PistolWeapon | ShotgunWeapon

export type WeaponType = 'pistol' | 'shotgun' | 'smg' | 'rocketlauncher'

export type WeaponStat = 'bullet_speed' | 'bullet_dmg' | 'shoot_cd' | 
                         'mag_ammo' | 'total_ammo' | 'reload_time' | 'max_ammo'