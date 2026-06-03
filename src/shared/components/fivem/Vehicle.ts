import { EntityComponent } from "../EntityComponent";
import type { Vec3 }        from "../../math/Vec3";

export class Vehicle extends EntityComponent {
    speed: number;
    gear:  number;
    rpm:   number;

    constructor(data: { model: number; position: Vec3; rotation: Vec3; speed: number; gear: number; rpm: number }) {
        super(data);
        this.speed = data.speed;
        this.gear  = data.gear;
        this.rpm   = data.rpm;
    }
}
