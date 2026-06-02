import type { Component } from "../core/Component";
import type { Vec3 } from "../math/Vec3";

export interface EntityComponent extends Component {
    model:    number;
    position: Vec3;
    rotation: Vec3;
}
