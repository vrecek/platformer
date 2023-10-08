class Game {
    canvas;
    ctx;
    level;
    levels;
    points;
    totalPoints;
    constructor(levels) {
        this.canvas = document.querySelector('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.levels = levels;
        this.level = 1;
        this.points = 0;
        this.totalPoints = 0;
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
    // Handle the score text
    updateScoreText(points) {
        const lvl = document.querySelector('h1'), scores = document.querySelector('h2');
        if (points)
            this.points += points;
        lvl.textContent = `Level ${this.level}`;
        scores.textContent = `Score: ${this.points}/${this.totalPoints}`;
    }
    // Update the lvl statistics
    updateLevelStats(level, totalPoints) {
        this.level = level;
        this.totalPoints = totalPoints;
        this.updateScoreText();
    }
    // Handles picking up the score
    handleGettingScore(sc, ent) {
        this.updateScoreText(1);
        sc.scores.splice(sc.scores.findIndex(x => x.getStats().id === ent.getStats().id), 1);
    }
    // Checks if the player has gotten every point
    hasLevelBeenFinished() {
        return this.points === this.totalPoints;
    }
    // Loads and sets up the next level
    loadNextLevel() {
        const nextLevel = this.levels?.[this.level] ?? null;
        if (nextLevel) {
            this.level++;
            this.points = 0;
            this.totalPoints = nextLevel.scores.length;
        }
        return nextLevel;
    }
    // Gets the current level
    getCurrentLevel() {
        return this.level;
    }
    // Gets the current level details
    getCurrentLevelDetails() {
        return this.levels?.[this.level - 1] ?? null;
    }
    // Returns the CTX
    getCtx() {
        return this.ctx;
    }
    // Returns the ctx stats
    getCanvasStats() {
        return {
            w: this.canvas.width,
            h: this.canvas.height
        };
    }
}
export default Game;
