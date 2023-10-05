class Entity {
    x;
    y;
    w;
    h;
    ctx;
    constructor(x, y, w, h, ctx) {
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        this.ctx = ctx;
    }
    // Draw the entity
    draw(color) {
        this.ctx.beginPath();
        this.ctx.rect(this.x, this.y, this.w, this.h);
        this.ctx.fillStyle = color;
        this.ctx.fill();
    }
    // Get the position and size
    getStats() {
        return {
            x: this.x,
            y: this.y,
            w: this.w,
            h: this.h
        };
    }
}
export default Entity;
