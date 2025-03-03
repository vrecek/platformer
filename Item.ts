import Entity from "./Entity.js";
import { Items, Maybe } from "./interfaces/EntityTypes.js";
import Player from "./Player.js";


class Item extends Entity
{
    private activate_fn: Maybe<(plr: Player, init_jump: number, init_speed: number) => boolean>

    
    public constructor(x: number, y: number, type: Items)
    {
        let image: string = ""

        switch (type)
        {
            case 'jump': 
                image = '/data/items/item_jump.svg'; 
                super(x, y, 30, 30, {image, name: type})

                this.activate_fn = (plr: Player, init_jump: number, init_speed: number) => {
                    if (!plr.isTouchingGround())
                        return false

                    plr.setPlayerJumpPower(10)
                    plr.jump()
                    plr.setPlayerJumpPower(init_jump)
                    plr.setPlayerSpeed(init_speed)

                    return true
                }

                break

            default:
                super(x, y, 40, 40, {image, name: type})
                this.activate_fn = null
        }
    }


    public activate(plr: Player, init_jump: number, init_speed: number): boolean
    {
        return this.activate_fn?.(plr, init_jump, init_speed) ?? false
    }
}


export default Item