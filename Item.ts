import Entity from "./Entity.js";
import { Items, Maybe } from "./interfaces/EntityTypes.js";
import Player from "./Player.js";


class Item extends Entity
{
    private activate_fn: Maybe<(plr: Player, init_jump: number, init_speed: number) => boolean>

    
    private calculateAnimationStep(timeout_ms: number, interval_ms: number): number
    {
        return (100 * interval_ms) / timeout_ms
    }

    private getEffectContainer(effect: string, as_animation_bar?: boolean): HTMLElement
    {
        return document.querySelector(`section.effects div.effect-${effect} ${as_animation_bar ? "div.bar div" : ""}`)!
    }

    private toggleEffectContainer(effect: string): void
    {
        this.getEffectContainer(effect).classList.toggle('active')
    }


    public constructor(x: number, y: number, type: Items)
    {        
        const INTERVAL_LENGTH: number = 50
        let   image:           string = ""
        // clear animation if "jump" or block jumping
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


            case 'speed':
                const DURATION_LENGTH: number = 2000

                image = '/data/items/item_speed.svg'; 
                super(x, y, 30, 30, {image, name: type})

                this.activate_fn = (plr: Player, _, init_speed: number) => {
                    if (plr.isEffectActive('speed') || !plr.isTouchingGround())
                        return false

                    const container: HTMLElement = this.getEffectContainer('speed', true),
                          step:      number      = this.calculateAnimationStep(DURATION_LENGTH, INTERVAL_LENGTH)

                    let interval: number,
                        width:    number = 100


                    this.toggleEffectContainer(type)

                    plr.addActiveEffect('speed')
                    plr.setPlayerSpeed(init_speed * 2)

                    setTimeout(() => {
                        clearInterval(interval)

                        container.style.width = '0'
                        this.toggleEffectContainer(type)

                        plr.setPlayerSpeed(init_speed)
                        plr.removeActiveEffect('speed')

                    }, DURATION_LENGTH);

                    interval = setInterval(() => container.style.width = `${width -= step}%`, INTERVAL_LENGTH);

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