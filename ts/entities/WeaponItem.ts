import { Weapon, WeaponStats, WeaponType } from "../../interfaces/EntityTypes.js";
import degToRad from "../utils/degToRad.js";
import Entity from "./Entity.js";


class WeaponItem extends Entity
{
    private type:  WeaponType
    private stats: WeaponStats
    private src:   string


    public constructor(x: number, y: number, type: WeaponType)
    {
        let stats: WeaponStats,
            image: string


        switch (type)
        {
            case 'pistol':
                image = '/data/weapons/pistol.svg'
                stats = { bullet_dmg: 10, shoot_cd: 500, bullet_speed: 7 }

                super(x, y, 60, 60, {image})
                break

            case 'shotgun':
                const angle:   number = 15,
                      blt_nr:  number = 4,
                      a_start: number = degToRad(-angle)


                image = '/data/weapons/shotgun.svg'
                stats = {
                    bullet_dmg: 10, shoot_cd: 1000, bullet_speed: 6,
                    angle_start: a_start, 
                    bullet_nr:   blt_nr,
                    angle_step:  (degToRad(angle) - a_start) / (blt_nr - 1)
                }

                super(x, y, 60, 60, {image})
                break
            
            default:
                super(x, y, 60, 60)
        }

        this.stats = stats!
        this.src   = image!
        this.type  = type
    }


    public getWeaponStats(): Weapon
    {
        return {
            img:   this.src,
            type:  this.type,
            stats: {...this.stats}
        }
    }


    public getImage(): string
    {
        return this.src
    }
}


export default WeaponItem