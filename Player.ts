import Entity from "./Entity.js";
import { CollisionCb, EntityStats } from "./interfaces/EntityTypes.js";
import { CanvasStats, KeysInput } from "./interfaces/GameTypes.js";
import { MoveKeys, PlayerPos } from "./interfaces/PlayerTypes.js";


// const INIT_VEL: number = 5
// const FINISH_VEL: number = INIT_VEL / 10
const COLL_PADDING: number = .5


class Player extends Entity {
    private keys: KeysInput
    private movementStatus: boolean

    private speedx: number
    private jumpPower: number

    private INIT_FINISH_VEL: number

    private blockedKeys: Set<MoveKeys>

    private isJumping: boolean
    private isFalling: boolean

    private friction: number
    private initVelocity: number
    private finishVelocity: number


    public constructor(x: number, y: number, w: number, h: number, speed: number, jumpPower: number) {
        super(x, y, w, h)

        this.INIT_FINISH_VEL = jumpPower / 10

        this.isJumping = false
        this.isFalling = false

        this.initVelocity = jumpPower 
        this.finishVelocity = this.INIT_FINISH_VEL
        this.friction = .95

        this.blockedKeys = new Set<MoveKeys>()
        this.movementStatus = true

        this.speedx = speed
        this.jumpPower = jumpPower

        this.keys = {
            pressed: false,
            pressedKeys: []
        }
    }

    private handleJumping(): void {
        if (this.keys.pressedKeys.includes('w') && !this.isJumping && !this.isFalling)
            this.isJumping = true
        if (!this.isJumping || !this.movementStatus || this.isFalling) return


        if (this.initVelocity <= this.INIT_FINISH_VEL) {
            this.isJumping = false
            this.isFalling = true
        }

        // Jumps up
        if (this.isJumping) {
            this.initVelocity *= this.friction
            this.y -= this.initVelocity
        }
    }

    private resetJumpState(): void {
        this.isJumping = false
        this.isFalling = false
        this.initVelocity = this.jumpPower
        this.finishVelocity = this.INIT_FINISH_VEL
    }

    private checkMovementCondition(): boolean {
        if (
            !this.keys.pressed ||
            !this.movementStatus ||
            (this.blockedKeys.size && [...this.blockedKeys].some(x => this.keys.pressedKeys.includes(x)))
        )
            return true


        return false
    }


    // Handles the gravity (jumping up and down from an entity)
    public handleGravity(entColl: boolean, canvasStats: CanvasStats): void {
        if (this.isCanvasCollided(canvasStats) && this.y + this.h === canvasStats.h) {
            this.resetJumpState()
            return
        }
        if (!this.movementStatus || !this.isFalling && (entColl || this.isJumping)) 
            return


        this.isFalling = true

        this.finishVelocity *= ((1 % this.friction) + 1)
        this.y += this.finishVelocity
    }


    // Detects the collision of the player
    public checkCollision(entities: Entity[], collidedFn?: CollisionCb, uncollidedFn?: CollisionCb): Entity | null {
        for (const ent of entities) {
            const { x, y, w, h } = ent.getStats()

            if (
                ((this.x + this.w >= x) && (this.y + this.h >= y)) &&
                ((this.x <= x + w) && (this.y <= y + h))
            ) {
                collidedFn ? collidedFn(ent) : null

                return ent
            }
            else {
                uncollidedFn ? uncollidedFn(ent) : null
            }
        }

        return null
    }


    // // Check if the canvas is collided
    public isCanvasCollided(canvas: CanvasStats): boolean {
        const plrYHeight: number = this.y + this.h

        if (!this.y || !this.x || plrYHeight >= canvas.h || this.x + this.w === canvas.w)
            return true

        return false
    }


    // Handle canvas collision
    public handleCanvasCollision(canvas: CanvasStats): void {
        const plrYHeight: number = this.y + this.h


        if (this.y <= 0) {
            this.isFalling = true
            this.isJumping = false

            this.y = COLL_PADDING
            this.blockedKeys.add('w')
        }
        
        if (this.x <= 0)
            this.blockedKeys.add('a')

        if (plrYHeight >= canvas.h) {
            this.y = canvas.h - this.h // - COLL_PADDING

            this.blockedKeys.add('s')
        }

        if (this.x + this.w === canvas.w)
            this.blockedKeys.add('d')
    }


    // Stops the movement when the player collides with an entity
    public stopCollisionMovement(ent: Entity): void {
        const e: EntityStats = ent.getStats(),
              plrYHeight: number = this.y + this.h


        // If the player is falling down to an object
        if (
            this.isFalling && plrYHeight >= e.y && 
            this.x < e.x + e.w && this.x + this.w > e.x
        ) {
            this.resetJumpState()
            this.y = e.y - e.h // - COLL_PADDING
        }

        // If the player jump-touches an object from the ground
        if (e.y + e.h <= this.y + 10 && !this.isFalling) {
            this.isJumping = false
            this.y = e.y + e.h + COLL_PADDING
        }


        // Stop moving towards the collided object
        if (e.y + e.h === this.y)
            this.blockedKeys.add('w')
        else if (e.x + e.w === this.x)
            this.blockedKeys.add('a')
        else if (e.y === plrYHeight) 
            this.blockedKeys.add('s')
        else if (this.x + this.w === e.x)
            this.blockedKeys.add('d')

    }


    // Changes the player position
    public setPlayerPos(newX: number, newY: number): void {
        this.x = newX
        this.y = newY
    }


    // Handle the standard W,A,S,D movement (Move in all directions, no jumping)
    public handleStandardMoveKeys(): void {
        if (this.checkMovementCondition())
            return


        if (this.keys.pressedKeys.includes('w'))
            this.y -= this.speedx

        if (this.keys.pressedKeys.includes('a'))
            this.x -= this.speedx

        if (this.keys.pressedKeys.includes('s'))
            this.y += this.speedx

        if (this.keys.pressedKeys.includes('d'))
            this.x += this.speedx
    }


    // Handle advanced movement
    public handleAdvancedMoveKeys(): void {
        this.handleJumping()
        
        if (this.checkMovementCondition())
            return


        if (this.keys.pressedKeys.includes('a'))
            this.x -= this.speedx

        if (this.keys.pressedKeys.includes('d'))
            this.x += this.speedx

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


    // Clears the blocked keys array
    public resetBlockedKeys(): void {
        this.blockedKeys.clear()
    }


    //-------------------------- GETTERS


    // Get the movement status
    public getMovementStatus(): boolean {
        return this.movementStatus
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