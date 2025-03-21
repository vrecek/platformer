import Entity from "./entities/Entity.js";


class Exit extends Entity
{
    public constructor(x: number, y: number)
    {
        super(x, y, 40, 80, {image: "/data/exit.svg"})
    }
}


export default Exit