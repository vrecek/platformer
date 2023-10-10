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
    handleGettingScore(level, ent) {
        this.updateScoreText(1);
        level.scores = level.scores.filter(x => x.getStats().id !== ent.getStats().id);
    }
    // Checks if the player has gotten every point
    hasLevelBeenFinished() {
        return this.points === this.totalPoints;
    }
    // Get and set the level details
    loadLevel(type) {
        const isCurrent = type === 'current', newLevel = this.levels[this.level - (isCurrent ? 1 : 0)];
        if (newLevel) {
            this.level += isCurrent ? 0 : 1;
            this.points = 0;
            this.totalPoints = newLevel.scores.length;
        }
        return newLevel ? { ...newLevel } : null;
    }
    // Gets the current level
    getCurrentLevel() {
        return this.level;
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
