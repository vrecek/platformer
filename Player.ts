import Entity from "./Entity.js";
import { KeysInput, VoidFn } from "./interfaces/GameTypes.js";


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
    public checkCollision(entities: Entity[], collidedFn?: VoidFn, uncollidedFn?: VoidFn): void {
        for (const ent of entities) {
            const {x, y, w, h} = ent.getStats()

            if (
                ( (this.x + this.w >= x) && (this.y + this.h >= y) ) && 
                ( (this.x <= x + w) && (this.y <= y + h) )
            ) {
                collidedFn ? collidedFn() : null
            }
            else 
                uncollidedFn ? uncollidedFn() : null
        }
    }


    // Handle the W,A,S,D movement
    public handleMoveKeys(): void {
        if (!this.keys.pressed || !this.movementStatus)
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
        this.movementStatus = val ? val : !this.movementStatus
    }


    // Get the movement status
    public get getMovementStatus(): boolean {
        return this.movementStatus
    }
}


export default Player