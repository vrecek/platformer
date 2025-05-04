import Entity from "../ts/entities/Entity"
import Game from "../ts/Game"
import { Bindings } from "./PlayerTypes"


export type OptionalArgs = {
    name?:         Maybe
    color?:        Maybe
    image?:        Maybe
    animPath?:     Maybe<AnimationArg>
}

export type ShootDirection = 'left' | 'right'

export type EnemyArgs = ActionArgs & {
    weapon: Weapon
}

export type EntityPos = {
    x: number
    y: number
}

export type PlayerArgs = {
    weapon?:     Weapon
    health?:     number
    armor?:      number
    armor_prot?: number
    armor_max?:  number
    godmode?:    boolean
    game?:       Maybe<Game>
}

export type ActionArgs = OptionalArgs & {
    weapon?:     Weapon
    health?:     number
    armor?:      number
    armor_max?:  number
    armor_prot?: number
    direction?:  ShootDirection
    godmode?:    boolean
    game?:       Maybe<Game>
    bindings?:   Bindings
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
    obj:             Entity
    type:            BulletType
    dir:             BulletDirection
    dirX:            number
    dirY:            number
    explosionObj?:   ExplosionBulletObject
    flame_affected?: string[]
}

export type ExplosionBulletObject = {
    sizeStep: number
    affected: string[]
    timeout?: Maybe< number>
}

export type FlameBulletObject = {
    affected:     string[]
    dmg_cooldown: number
}

export type BulletType = 'regular' | 'explosive' | 'explosion' | 'flamestream'

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
    bullet_nr:   number
}

export type FlameWeapon = WeaponCommon & {
    maxflame:     number
    flamestep:    number
    dmg_cooldown: number
}

export type WeaponStats = PistolWeapon | ShotgunWeapon | FlameWeapon

export type WeaponType = 'pistol' | 'shotgun' | 'smg' | 'rocketlauncher' | 'flamethrower' | 'machinegun'

export type WeaponStat = 'bullet_speed' | 'bullet_dmg' | 'shoot_cd' | 'angle' |
                         'mag_ammo' | 'total_ammo' | 'reload_time' | 'max_ammo'

export type DamageObject = {
    killed:   boolean
    dmgdealt: number
}