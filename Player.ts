import Entity from "./Entity.js";
import { CollisionCb, EntityStats } from "./interfaces/EntityTypes.js";
import { KeysInput } from "./interfaces/GameTypes.js";
import { MoveKeys, PlayerPos } from "./interfaces/PlayerTypes.js";


class Player extends Entity {
    private keys: KeysInput
    private speed: number
    private movementStatus: boolean

    public constructor(x: number, y: number, w: number, h: number, speed: number, ctx: CanvasRenderingContext2D) {
        super(x, y, w, h, ctx)

        this.movementStatus = true
        this.speed = speed
        this.keys = {
            pressed: false,
            pressedKeys: []
        }
    }


    // Detects the collision of the player
    public checkCollision(entities: Entity[], collidedFn?: CollisionCb, uncollidedFn?: CollisionCb): boolean {
        for (const ent of entities) {
            const { x, y, w, h } = ent.getStats()

            if (
                ((this.x + this.w >= x) && (this.y + this.h >= y)) &&
                ((this.x <= x + w) && (this.y <= y + h))
            ) {
                collidedFn ? collidedFn(ent) : null

                return true
            }
            else {
                uncollidedFn ? uncollidedFn(ent) : null
            }
        }

        return false
    }


    // Handle canvas collision
    public handleCanvasCollision(blockedKeys: MoveKeys[], canvas: EntityStats): void {
        if (!this.y)
            blockedKeys.push('w')

        if (!this.x)
            blockedKeys.push('a')

        if (this.y + this.h === canvas.h)
            blockedKeys.push('s')

        if (this.x + this.w === canvas.w)
            blockedKeys.push('d')
    }


    // If collided, returns the (movement) key, which caused the collision
    public getCollisionStopKey(e: EntityStats): MoveKeys | undefined {
        let k: MoveKeys | undefined = undefined

        if (e.y + e.h === this.y)
            k = 'w'
        else if (e.x + e.w === this.x)
            k = 'a'
        else if (e.y === this.y + this.h)
            k = 's'
        else if (this.x + this.w === e.x)
            k = 'd'


        return k
    }



    // Changes the player position
    public setPlayerPos(newX: number, newY: number): void {
        this.x = newX
        this.y = newY
    }


    // Handle the standard W,A,S,D movement (Move in all directions, no jumping)
    public handleStandardMoveKeys(stopKey?: MoveKeys[]): void {
        if (
            !this.keys.pressed ||
            !this.movementStatus ||
            (stopKey?.length && stopKey.some(x => this.keys.pressedKeys.includes(x)))
        )
            return


        if (this.keys.pressedKeys.includes('w'))
            this.y -= this.speed

        if (this.keys.pressedKeys.includes('a'))
            this.x -= this.speed

        if (this.keys.pressedKeys.includes('s'))
            this.y += this.speed

        if (this.keys.pressedKeys.includes('d'))
            this.x += this.speed
    }


    // Initialize the "keydown" and "keyup" events to catch the pressed keys
    public initPressKeyEvents(): void {
        const possibleKeys: string[] = ['w', 'a', 's', 'd']

        window.addEventListener('keydown', ({ key }) => {
            if (!possibleKeys.includes(key) || this.keys.pressedKeys.includes(key))
                return

            this.keys.pressed = true
            this.keys.pressedKeys.push(key)
        })

        window.addEventListener('keyup', ({ key }) => {
            this.keys.pressedKeys.splice(this.keys.pressedKeys.indexOf(key), 1)

            if (!this.keys.pressedKeys.length)
                this.keys.pressed = false
        })
    }


    // Toggle or change the player movement
    public changePlayerMovementStatus(val?: boolean): void {
        this.movementStatus = typeof val !== 'undefined' 
                                        ? val 
                                        : !this.movementStatus
    }


    // Get the movement status
    public getMovementStatus(): boolean {
        return this.movementStatus
    }


    // Get the pressed keys
    public getKeys(): string[] {
        return this.keys.pressedKeys
    }


    // Get the player position
    public getPlayerPosition(): PlayerPos {
        return {
            x: this.x,
            y: this.y
        }
    }
}


export default Player