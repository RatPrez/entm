import { Component }  from "../core/Component";
import type { Vec3 } from "../math/Vec3";

export abstract class WorldObject extends Component {
    model:      number;
    position:   Vec3;
    rotation:   Vec3;
    networked:  boolean;

    constructor(data: { model: number; position: Vec3; rotation: Vec3, networked: boolean }) {
        super();
        this.model      = data.model;
        this.position   = data.position;
        this.rotation   = data.rotation;
        this.networked  = data.networked;
    }
}
