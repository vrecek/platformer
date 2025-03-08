import Entity from "./Entity.js";
import { Platforms } from "../../interfaces/EntityTypes.js";


class Platform extends Entity
{
    public constructor(x: number, y: number, w: number, type: Platforms)
    {
        let color:  string = '#000',
            height: number = 0 

        switch (type)
        {
            case 'jump':  color = '#dbc01d'; height = 10; break
            case 'speed': color = '#ff830b'; height = 5;  break
        }

        super(x, y, w, height, {color, name: type})
    }
}


export default Platform