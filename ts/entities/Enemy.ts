import { ActionDefaults, AnimationArg, Maybe } from "../../interfaces/EntityTypes.js";
import Action from "./Action.js";


class Enemy extends Action
{
    public constructor(x: number, y: number, w: number, h: number, animPath?: AnimationArg, act_defaults?: Maybe<ActionDefaults>)
    {
        super(x, y, w, h, {color: '#e73737', animPath, act_defaults})
    }
}


export default Enemy 