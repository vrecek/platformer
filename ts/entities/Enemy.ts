import { Maybe, OptionalEnemyArgs } from "../../interfaces/EntityTypes.js";
import Action from "./Action.js";


class Enemy extends Action
{
    private shooter:   boolean
    private can_shoot: boolean


    public constructor(x: number, y: number, w: number, h: number, args?: Maybe<OptionalEnemyArgs>)
    {
        super(x, y, w, h, {...args, color: '#e73737'})

        this.can_shoot = true
        this.shooter   = args?.shoot ?? false
    }


    public override shoot(): void
    {
        if (this.shooter && this.can_shoot)
            super.shoot()
    }


    public isShooter(): boolean
    {
        return this.shooter
    }


    public override toggleAnimation(should_move: boolean): void
    {
        super.toggleAnimation(should_move)

        this.can_shoot = should_move
    }
}


export default Enemy 