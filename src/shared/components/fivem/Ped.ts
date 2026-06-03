import { EntityComponent } from "../EntityComponent";
import type { Vec3 }        from "../../math/Vec3";

export class Ped extends EntityComponent {
    health: number;
    armour: number;

    constructor(data: { model: number; position: Vec3; rotation: Vec3; health: number; armour: number }) {
        super(data);
        this.health = data.health;
        this.armour = data.armour;
    }
}
