class Entity {
    id;
    x;
    y;
    w;
    h;
    animation;
    constructor(x, y, w, h, animPath) {
        this.id = Math.random().toString().slice(2);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.animation = animPath ? {
            speed: animPath.speed,
            shouldMove: true,
            moveLevel: 1,
            paths: [
                { x, y },
                ...animPath.paths
            ]
        } : null;
    }
    // Handles the moving animation of an entity
    animationHandler(arg, currentPath) {
        if (!this.animation)
            return;
        if (this[arg] !== currentPath[arg]) {
            if (this[arg] < currentPath[arg]) {
                this[arg] += this.animation.speed;
                if (this[arg] > currentPath[arg])
                    this[arg] = currentPath[arg];
            }
            else {
                this[arg] -= this.animation.speed;
                if (this[arg] < currentPath[arg])
                    this[arg] = currentPath[arg];
            }
        }
    }
    // Draw the entity as a rectangle
    draw(color, ctx, onlyBorders) {
        if (this?.animation?.shouldMove && this.animation.paths.length > 1) {
            const { moveLevel, paths } = this.animation;
            const currentPath = paths[moveLevel];
            this.animationHandler('x', currentPath);
            this.animationHandler('y', currentPath);
            if (this.x === currentPath.x && this.y === currentPath.y) {
                this.animation.moveLevel = paths[moveLevel + 1] ? moveLevel + 1 : 0;
            }
        }
        ctx.beginPath();
        ctx.rect(this.x, this.y, this.w, this.h);
        if (onlyBorders) {
            ctx.strokeStyle = color;
            ctx.stroke();
        }
        else {
            ctx.fillStyle = color;
            ctx.fill();
        }
    }
    // Get the position and size
    getStats() {
        return {
            id: this.id,
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        };
    }
    // Toggle the animation
    toggleAnimation(val) {
        if (!this.animation)
            return;
        this.animation.shouldMove = val;
    }
}
export default Entity;
