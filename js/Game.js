class Game {
    canvas;
    ctx;
    constructor() {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
    }
    // Sets the canvas width
    setWidth(w, h) {
        this.canvas.width = w;
        this.canvas.height = h;
    }
    // Update every frame
    update(fn) {
        const refresh = () => {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            fn();
            window.requestAnimationFrame(refresh);
        };
        window.requestAnimationFrame(refresh);
    }
    // Returns the CTX
    get getCtx() {
        return this.ctx;
    }
}
export default Game;
