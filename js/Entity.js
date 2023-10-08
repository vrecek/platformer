class Entity {
    id;
    x;
    y;
    w;
    h;
    constructor(x, y, w, h) {
        this.id = Math.random().toString().slice(2);
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
    }
    // Draw the entity as a rectangle
    draw(color, ctx, onlyBorders) {
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
}
export default Entity;
