import { Maybe } from "../../interfaces/EntityTypes.js";
import Entity from "./Entity.js";


class Ammo extends Entity
{
    private ammo_count: Maybe<number>


    public constructor(x: number, y: number, ammoCount?: number)
    {
        super(x, y, 25, 25, {image: '/data/bullets.svg'})

        this.ammo_count = ammoCount
    }

    
    public getAmmoCount(): Maybe<number>
    {
        return this.ammo_count
    }
}


export default Ammo