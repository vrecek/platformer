import { Weapon, WeaponStats, WeaponType } from "../../interfaces/EntityTypes.js";
import degToRad from "../utils/degToRad.js";
import Entity from "./Entity.js";


class WeaponItem extends Entity
{
    private type:     WeaponType
    private stats:    WeaponStats
    private src:      string
    private inf_ammo: boolean
    private wav:      string


    public constructor(x: number, y: number, type: WeaponType, infinite_ammo?: boolean)
    {
        let stats: WeaponStats,
            image: string = '',
            wav:   string = ''


        switch (type)
        {
            case 'pistol':
                image = '/data/weapons/pistol.svg'
                wav   = '/data/weapons/sounds/pistol.wav'
                stats = { 
                    bullet_dmg: 10, shoot_cd: 500, bullet_speed: 7, mag_ammo: 7,
                    total_ammo: 28, reload_time: 500, max_ammo: 28,
                }

                super(x, y, 60, 60, {image})
                break

            case 'smg':
                image = '/data/weapons/smg.svg'
                wav   = '/data/weapons/sounds/pistol.wav'
                stats = { 
                    bullet_dmg: 7, shoot_cd: 120, bullet_speed: 7,  max_ammo: 60,
                    mag_ammo: 30, total_ammo: 60, reload_time: 800
                }

                super(x, y, 60, 60, {image})
                break

            case 'rocketlauncher':
                image = '/data/weapons/rocketlauncher.svg'
                wav   = '/data/weapons/sounds/rocketlauncher.wav'
                stats = { 
                    bullet_dmg: 15, shoot_cd: 2000, bullet_speed: 6, max_ammo: 3,
                    mag_ammo: 1, total_ammo: 3, reload_time: 2000 
                }

                super(x, y, 60, 60, {image})
                break

            case 'shotgun':
                const angle:   number = 15,
                      blt_nr:  number = 4, //8,
                      a_start: number = degToRad(-angle)


                image = '/data/weapons/shotgun.svg'
                wav   = '/data/weapons/sounds/shotgun.wav'
                stats = {
                    bullet_dmg: 10, shoot_cd: 1000, bullet_speed: 6, mag_ammo: 4, total_ammo: 12, max_ammo: 12,
                    reload_time: 1000,
                    angle_start: a_start, 
                    bullet_nr:   blt_nr,
                    angle_step:  (degToRad(angle) - a_start) / (blt_nr - 1) //(Math.PI*2)/blt_nr
                }

                super(x, y, 60, 60, {image})
                break
            
            default:
                super(x, y, 60, 60)
        }

        this.stats    = stats!
        this.src      = image!
        this.type     = type
        this.inf_ammo = !!infinite_ammo
        this.wav      = wav
    }


    public getWeaponStats(): Weapon
    {
        return {
            img:          this.src,
            inf_ammo:     this.inf_ammo,
            is_reloading: false,
            type:         this.type,
            wav:          this.wav,
            stats:        {...this.stats}
        }
    }
}


export default WeaponItem