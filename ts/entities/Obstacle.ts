import { Maybe, OptionalArgs } from "../../interfaces/EntityTypes.js";
import Entity from "./Entity.js";


class Obstacle extends Entity
{
    public constructor(x: number, y: number, w: number, h: number, args?: Maybe<OptionalArgs>)
    {
        super(x, y, w, h, {...args, color: '#e73737'})
    }
}


export default Obstacle