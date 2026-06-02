import type { Component } from "../core/Component";

export interface CfxEntity extends Component {
    readonly sType:      "cfxEntity";
    readonly handle:     number;
    readonly model:      number;
    readonly entityType: string;
    readonly netId:      number | null;
}
