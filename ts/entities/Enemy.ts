import { EnemyArgs, EntityStats, Maybe, ShootDirection } from "../../interfaces/EntityTypes.js";
import { PlayerStats } from "../../interfaces/PlayerTypes.js";
import Action from "./Action.js";
import Entity from "./Entity.js";


class Enemy extends Action
{
    private allow_shoot: boolean

    // flamethrwoer iamge
    private set_shooter_image(): void
    {
        this.setImage(`/data/enemies/${this.weapon!.type}/enemy_${this.weapon!.type}_${this.last_dir}.svg`)
    }


    public constructor(x: number, y: number, w: number, h: number, args: EnemyArgs)
    {
        super(x, y, w, h, {...args, color: '#e73737', armor: -1})

        this.allow_shoot = true

        this.set_shooter_image()
        this.addBinding('entity_shoot', ['flame'], () => {})
    }


    public shoot_smart(plr: PlayerStats, surfaces: Entity[]): boolean
    {
        if (this.weapon && this.allow_shoot && plr)
        { 
            const blocked: boolean = surfaces!.some(e => {
                const s: EntityStats = e.getStats()

                return (
                    s.y <= this.y && 
                    s.y+s.h >= this.y && 
                    s.x < this.x && 
                    s.x+s.w > plr.x+plr.w
                )
            })


            if (
                plr.y+plr.h >= this.y && 
                plr.y <= this.y &&
                !blocked
            )
            {
                const new_dir: ShootDirection = plr.x < this.x ? 'left' : 'right'

                if (this.hasShotBullet('flamestream') && this.last_dir !== new_dir)
                {
                    this.removeKey('flame')

                    return false
                }

                this.last_dir = new_dir

                this.set_shooter_image()
                this.addKey('flame')
                
                return super.shoot()
            }
        }
        
        this.removeKey('flame')
        
        return false
    }


    public override toggleAnimation(should_move: boolean): void
    {
        super.toggleAnimation(should_move)

        this.allow_shoot = should_move
    }
}


export default Enemy 