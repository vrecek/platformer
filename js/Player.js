import Entity from "./Entity.js";
class Player extends Entity {
    keys;
    speed;
    movementStatus;
    constructor(x, y, w, h, speed, ctx) {
        super(x, y, w, h, ctx);
        this.movementStatus = true;
        this.speed = speed;
        this.keys = {
            pressed: false,
            pressedKeys: []
        };
    }
    // Detects the collision of the player
    checkCollision(entities, collidedFn, uncollidedFn) {
        for (const ent of entities) {
            const { x, y, w, h } = ent.getStats();
            if (((this.x + this.w >= x) && (this.y + this.h >= y)) &&
                ((this.x <= x + w) && (this.y <= y + h))) {
                collidedFn ? collidedFn() : null;
            }
            else
                uncollidedFn ? uncollidedFn() : null;
        }
    }
    // Handle the W,A,S,D movement
    handleMoveKeys() {
        if (!this.keys.pressed || !this.movementStatus)
            return;
        if (this.keys.pressedKeys.includes('w'))
            this.y -= this.speed;
        if (this.keys.pressedKeys.includes('a'))
            this.x -= this.speed;
        if (this.keys.pressedKeys.includes('s'))
            this.y += this.speed;
        if (this.keys.pressedKeys.includes('d'))
            this.x += this.speed;
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
        this.movementStatus = val ? val : !this.movementStatus;
    }
    // Get the movement status
    get getMovementStatus() {
        return this.movementStatus;
    }
}
export default Player;
