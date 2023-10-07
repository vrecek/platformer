import Entity from "./Entity.js";
const INIT_VEL = 5;
const FINISH_VEL = INIT_VEL / 10;
const COLL_PADDING = .5;
class Player extends Entity {
    keys;
    movementStatus;
    speedx;
    blockedKeys;
    isJumping;
    isFalling;
    friction;
    initVelocity;
    finishVelocity;
    constructor(x, y, w, h, speed, ctx) {
        super(x, y, w, h, ctx);
        this.isJumping = false;
        this.isFalling = false;
        this.initVelocity = INIT_VEL;
        this.finishVelocity = FINISH_VEL;
        this.friction = .95;
        this.blockedKeys = [];
        this.movementStatus = true;
        this.speedx = speed;
        this.keys = {
            pressed: false,
            pressedKeys: []
        };
    }
    handleJumping() {
        if (this.keys.pressedKeys.includes('w') && !this.isJumping) {
            this.isJumping = true;
        }
        if (!this.isJumping || !this.movementStatus)
            return;
        if (this.initVelocity <= FINISH_VEL) {
            this.isJumping = false;
            this.isFalling = true;
        }
        // Jumps up
        if (this.isJumping) {
            this.initVelocity *= this.friction;
            this.y -= this.initVelocity;
        }
    }
    resetJumpState() {
        this.isJumping = false;
        this.isFalling = false;
        this.initVelocity = INIT_VEL;
        this.finishVelocity = FINISH_VEL;
    }
    checkMovementCondition() {
        if (!this.keys.pressed ||
            !this.movementStatus ||
            (this.blockedKeys?.length && this.blockedKeys.some(x => this.keys.pressedKeys.includes(x))))
            return true;
        return false;
    }
    // Handles the gravity (jumping up and down from an entity)
    handleGravity(entColl, canvasColl) {
        if (entColl || canvasColl || this.isJumping) {
            if (!this.isJumping) {
                this.resetJumpState();
            }
            return;
        }
        this.finishVelocity *= ((1 % this.friction) + 1);
        this.y += this.finishVelocity;
    }
    // Detects the collision of the player
    checkCollision(entities, collidedFn, uncollidedFn) {
        for (const ent of entities) {
            const { x, y, w, h } = ent.getStats();
            if (((this.x + this.w >= x) && (this.y + this.h >= y)) &&
                ((this.x <= x + w) && (this.y <= y + h))) {
                collidedFn ? collidedFn(ent) : null;
                return ent;
            }
            else {
                uncollidedFn ? uncollidedFn(ent) : null;
            }
        }
        return null;
    }
    // Check if the canvas is collided
    isCanvasCollided(canvas) {
        const plrYHeight = this.y + this.h;
        if (!this.y || !this.x || plrYHeight >= canvas.h || this.x + this.w === canvas.w)
            return true;
        return false;
    }
    // Handle canvas collision
    handleCanvasCollision(canvas) {
        const plrYHeight = this.y + this.h;
        if (!this.y)
            this.blockedKeys.push('w');
        if (!this.x)
            this.blockedKeys.push('a');
        if (plrYHeight >= canvas.h) {
            this.y = canvas.h - this.h; // - COLL_PADDING
            this.blockedKeys.push('s');
        }
        if (this.x + this.w === canvas.w)
            this.blockedKeys.push('d');
    }
    // Stops the movement when the player collides with an entity
    stopCollisionMovement(ent) {
        const e = ent.getStats(), plrYHeight = this.y + this.h;
        // If the player is falling down to an object
        if (this.isFalling && plrYHeight >= e.y) {
            this.resetJumpState();
            this.y = e.y - e.h; // - COLL_PADDING
        }
        // If the player jump-touches an object from the ground
        if (e.y + e.h <= this.y + 10) {
            this.isJumping = false;
            this.y = e.y + e.h + COLL_PADDING;
        }
        // Stop moving towards the collided object
        if (e.y + e.h === this.y)
            this.blockedKeys.push('w');
        else if (e.x + e.w === this.x)
            this.blockedKeys.push('a');
        else if (e.y === plrYHeight)
            this.blockedKeys.push('s');
        else if (this.x + this.w === e.x)
            this.blockedKeys.push('d');
    }
    // Changes the player position
    setPlayerPos(newX, newY) {
        this.x = newX;
        this.y = newY;
    }
    // Handle the standard W,A,S,D movement (Move in all directions, no jumping)
    handleStandardMoveKeys() {
        if (this.checkMovementCondition())
            return;
        if (this.keys.pressedKeys.includes('w'))
            this.y -= this.speedx;
        if (this.keys.pressedKeys.includes('a'))
            this.x -= this.speedx;
        if (this.keys.pressedKeys.includes('s'))
            this.y += this.speedx;
        if (this.keys.pressedKeys.includes('d'))
            this.x += this.speedx;
    }
    // Handle advanced movement
    handleAdvancedMoveKeys() {
        this.handleJumping();
        if (this.checkMovementCondition())
            return;
        if (this.keys.pressedKeys.includes('a'))
            this.x -= this.speedx;
        if (this.keys.pressedKeys.includes('d'))
            this.x += this.speedx;
    }
    // Initialize the "keydown" and "keyup" events to catch the pressed keys
    initPressKeyEvents() {
        const possibleKeys = ['w', 'a', 's', 'd'];
        window.addEventListener('keydown', ({ key }) => {
            if (!possibleKeys.includes(key) || this.keys.pressedKeys.includes(key))
                return;
            this.keys.pressed = true;
            this.keys.pressedKeys.push(key);
        });
        window.addEventListener('keyup', ({ key }) => {
            this.keys.pressedKeys.splice(this.keys.pressedKeys.indexOf(key), 1);
            if (!this.keys.pressedKeys.length)
                this.keys.pressed = false;
        });
    }
    // Toggle or change the player movement
    changePlayerMovementStatus(val) {
        this.movementStatus = typeof val !== 'undefined'
            ? val
            : !this.movementStatus;
    }
    // Clears the blocked keys array
    resetBlockedKeys() {
        this.blockedKeys = [];
    }
    //-------------------------- GETTERS
    // Get the movement status
    getMovementStatus() {
        return this.movementStatus;
    }
    // Get the player position
    getPlayerPosition() {
        return {
            x: this.x,
            y: this.y
        };
    }
}
export default Player;
