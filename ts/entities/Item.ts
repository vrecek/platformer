import Entity from "./Entity.js";
import { Effects, Items, Maybe, Weapon } from "../../interfaces/EntityTypes.js";
import { Fn } from "../../interfaces/GameTypes.js";
import Player from "./Player.js";
import { ActivationObject } from "../../interfaces/PlayerTypes.js";


class Item extends Entity
{
    private interval?:   number
    private timeout?:    number
    private activate_fn: Maybe<(plr: Player, details: ActivationObject) => boolean>
    private finish_fn:   Maybe<Fn>

    
    private set_finish(fn: Maybe<Fn>): void
    {
        if (!this.finish_fn)
            this.finish_fn = fn
    }

    private calculateAnimationStep(timeout_ms: number, interval_ms: number): number
    {
        return (100 * interval_ms) / timeout_ms
    }

    private toggleEffectContainer(effect: string): void
    {
        this.getEffectContainer(effect).classList.toggle('active')
    }

    private initEffect(plr: Player, effect: Effects, duration_l: number, interval_l: number, start_fn: Fn<boolean>, end_fn?: Maybe<Fn>): boolean
    {
        if (plr.isEffectActive(effect) || !start_fn())
            return false

        const container: HTMLElement = this.getEffectContainer(effect, true),
              step:      number      = this.calculateAnimationStep(duration_l, interval_l)

        let width: number = 100

        this.toggleEffectContainer(effect)
        plr.addActiveEffect([effect], this)

        this.timeout = setTimeout(() => {
            Item.zeroEffectContainer(plr, effect)
            end_fn?.()

        }, duration_l);

        this.interval = setInterval(() => container.style.width = `${width -= step}%`, interval_l);

        return true
    }


    public constructor(x: number, y: number, type: Items)
    {        
        const INTERVAL_LENGTH: number = 50,
              SIZE:            number = 30

        let image:           string = "",
            duration_length: number = 0


        switch (type)
        {
            case 'jump': 
                image = '/data/items/item_jump.svg'; 
                super(x, y, SIZE, SIZE, {image, name: type})

                this.activate_fn = (plr: Player, {init_jump, init_speed}) => {
                    if (!plr.isTouchingGround())
                        return false

                    const current_power: number = plr.getStats().jump_power

                    if (plr.isEffectActive('speed', true))
                        Item.zeroEffectContainer(plr, 'speed')

                    plr.setPlayerJumpPower(10)
                    plr.setPlayerSpeed(init_speed)
                    plr.jump()

                    plr.setPlayerJumpPower(plr.isEffectActive('jumpboost') ? current_power : init_jump)

                    return true
                }

                break


            case 'jumpboost': 
                duration_length = 4000
                image           = '/data/items/item_jumpboost.svg'

                super(x, y, SIZE, SIZE, {image, name: type})

                this.activate_fn = (plr: Player, {init_jump}): boolean => {
                    this.set_finish(() => plr.setPlayerJumpPower(init_jump))

                    return this.initEffect(plr, type, duration_length, INTERVAL_LENGTH, () => {
                            
                        plr.setPlayerJumpPower(10)
                        return true

                    }, this.finish_fn)
                }

                break


            case 'speed':
                duration_length = 4000
                image           = '/data/items/item_speed.svg'

                super(x, y, SIZE, SIZE, {image, name: type})

                this.activate_fn = (plr: Player, {init_speed}): boolean => {
                    this.set_finish(() => plr.setPlayerSpeed(init_speed))

                    return this.initEffect(plr, type, duration_length, INTERVAL_LENGTH, () => {

                        if (!plr.isTouchingGround())
                            return false

                        plr.setPlayerSpeed(init_speed * 2)

                        return true

                    }, this.finish_fn)
                }

                break


            case 'invincibility':
                duration_length = 4000
                image           = '/data/items/item_invincibility.svg'

                super(x, y, SIZE, SIZE, {image, name: type})

                this.activate_fn = (plr: Player): boolean => {
                    return this.initEffect(plr, type, duration_length, INTERVAL_LENGTH, () => {
                        return true    
                    })
                }

                break


            case 'attackspeed':
                duration_length = 4000
                image           = '/data/items/item_rifle.svg'

                super(x, y, SIZE, SIZE, {image, name: type})

                this.activate_fn = (plr: Player): boolean => {
                    this.set_finish(() => { 
                        plr.setWeaponStats('shoot_cd', 'default')
                        plr.setWeaponStats('bullet_speed', 'default') 
                    })

                    const stats: Weapon = plr.getWeaponDefaults()!

                    return this.initEffect(plr, type, duration_length, INTERVAL_LENGTH, () => {
                        plr.setWeaponStats('shoot_cd', stats.stats.shoot_cd / 1.5)
                        plr.setWeaponStats('bullet_speed', stats.stats.bullet_speed + 2)
                        return true
                        
                    }, this.finish_fn)
                }

                break


            case 'attackdmg':
                duration_length = 4000
                image           = '/data/items/item_damage.svg'

                super(x, y, SIZE, SIZE, {image, name: type})

                this.activate_fn = (plr: Player): boolean => {
                    this.set_finish(() => { plr.setWeaponStats('bullet_dmg', 'default'); plr.setImage('/data/player/player.svg') })

                    return this.initEffect(plr, type, duration_length, INTERVAL_LENGTH, () => {
                        plr.setWeaponStats('bullet_dmg', plr.getWeaponDefaults()!.stats.bullet_dmg * 1.5)
                        plr.setImage('/data/player/player_mad.svg')

                        return true
                        
                    }, this.finish_fn)
                }

                break


            default:
                super(x, y, 40, 40, {image, name: type})
        }
    }


    public activate(plr: Player, details: ActivationObject): boolean
    {
        return this.activate_fn?.(plr, details) ?? false
    }


    public cancel_timers(): void
    {
        clearInterval(this.interval)
        clearTimeout(this.timeout)
    }


    public getEffectContainer(effect: string, as_animation_bar?: boolean): HTMLElement
    {
        return document.querySelector(`section.effects div.effect-${effect} ${as_animation_bar ? "div.bar div" : ""}`)!
    }


    public static zeroEffectContainer(plr: Player, effect: string): void
    {
        const item: Maybe<Item>    = plr.getActiveItem(effect),
              cont: Maybe<Element> = item?.getEffectContainer(effect)
                        
        if (!item || !cont)
            return

        item.cancel_timers()
        item.finish_fn?.()

        cont.classList.remove('active');
        (cont.children[1].children[0] as HTMLElement).style.width = '0'

        plr.removeActiveEffect(effect, true)
    }
}


export default Item