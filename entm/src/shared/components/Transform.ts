import type { Component, Vec3 } from "@entm/base";

export interface Transform extends Component
{
    readonly sType: "transform";
    position: Vec3;
    rotation: Vec3;
    scale:    Vec3;
}
