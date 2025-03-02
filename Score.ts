import Entity from "./Entity.js";


class Score extends Entity
{
    public constructor(x: number, y: number)
    {
        super(x, y, 20, 20, {image: "/data/score.png"})
    }
}


export default Score