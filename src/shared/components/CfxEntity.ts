import { Component } from "../core/Component";

export class CfxEntity extends Component {
    readonly sType = "cfxEntity" as const;
    readonly handle:     number;
    readonly model:      number;
    readonly entityType: string;
    readonly netId:      number | null;

    constructor(handle: number, model: number, entityType: string, netId: number | null) {
        super();
        this.handle     = handle;
        this.model      = model;
        this.entityType = entityType;
        this.netId      = netId;
    }
}
