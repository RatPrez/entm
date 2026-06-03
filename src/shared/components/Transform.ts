import { Component }  from "../core/Component";
import type { Vec3 } from "../math/Vec3";

export class Transform extends Component {
    readonly sType = "transform" as const;
    position: Vec3;
    rotation: Vec3;
    scale:    Vec3;

    constructor(data: { position: Vec3; rotation: Vec3; scale: Vec3 }) {
        super();
        this.position = data.position;
        this.rotation = data.rotation;
        this.scale    = data.scale;
    }
}
