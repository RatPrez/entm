import { Component }  from "../core/Component";
import type { Vec3 } from "../math/Vec3";

export abstract class EntityComponent extends Component {
    model:    number;
    position: Vec3;
    rotation: Vec3;

    constructor(data: { model: number; position: Vec3; rotation: Vec3 }) {
        super();
        this.model    = data.model;
        this.position = data.position;
        this.rotation = data.rotation;
    }
}
