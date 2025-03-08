import { AnimationArg } from "../../interfaces/EntityTypes.js";
import Action from "./Action.js";


class Enemy extends Action
{
    public constructor(x: number, y: number, w: number, h: number, animPath?: AnimationArg)
    {
        super(x, y, w, h, {color: '#e73737', animPath})
    }
}


export default Enemy 