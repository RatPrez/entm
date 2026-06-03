import { Entity }    from "../../shared/components/Entity";
import type { Vec3 } from "../../shared/math/Vec3";

export class SVehicle extends Entity {
    constructor(data: { model: number; position: Vec3; rotation: Vec3; }) {
        super({ ...data, networked: true });
    }
}
