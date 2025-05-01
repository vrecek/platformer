import { EnemyArgs, EntityStats, Maybe } from "../../interfaces/EntityTypes.js";
import { VoidFn } from "../../interfaces/GameTypes.js";
import { PlayerStats } from "../../interfaces/PlayerTypes.js";
import Action from "./Action.js";
import Entity from "./Entity.js";


class Enemy extends Action
{
    private allow_shoot: boolean


    private set_shooter_image(): void
    {
        this.setImage(`/data/enemies/${this.weapon!.type}/enemy_${this.weapon!.type}_${this.last_dir}.svg`)
    }


    public constructor(x: number, y: number, w: number, h: number, args: EnemyArgs)
    {
        super(x, y, w, h, {...args, color: '#e73737', armor: -1})

        this.allow_shoot = true

        this.set_shooter_image()
    }


    public override shoot(_?: Maybe<VoidFn>, plr?: PlayerStats, surfaces?: Entity[]): boolean
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
                this.last_dir = plr.x < this.x ? 'left' : 'right'

                this.set_shooter_image()

                return super.shoot()
            }
        }
        
        return false
    }


    public override toggleAnimation(should_move: boolean): void
    {
        super.toggleAnimation(should_move)

        this.allow_shoot = should_move
    }
}


export default Enemy 