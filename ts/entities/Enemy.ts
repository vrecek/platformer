import { EnemyArgs, EntityStats, Maybe } from "../../interfaces/EntityTypes.js";
import { VoidFn } from "../../interfaces/GameTypes.js";
import { PlayerStats } from "../../interfaces/PlayerTypes.js";
import Action from "./Action.js";
import Entity from "./Entity.js";


class Enemy extends Action
{
    private shooter:     boolean
    private allow_shoot: boolean


    public constructor(x: number, y: number, w: number, h: number, args?: Maybe<EnemyArgs>)
    {
        super(x, y, w, h, {...args, color: '#e73737'})

        this.allow_shoot = true
        this.shooter     = args?.shoot ?? false
    }


    public override shoot(_?: Maybe<VoidFn>, plr?: PlayerStats, surfaces?: Entity[]): boolean
    {
        if (this.shooter && this.allow_shoot && plr)
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
                return super.shoot()
        }
        
        return false
    }


    public isShooter(): boolean
    {
        return this.shooter
    }


    public override toggleAnimation(should_move: boolean): void
    {
        super.toggleAnimation(should_move)

        this.allow_shoot = should_move
    }
}


export default Enemy 