import { Component } from "../core/Component";

export class CfxEntity extends Component {
    readonly handle:     number;
    readonly model:      number;
    readonly entityType: number;
    readonly netId:      number | null;

    constructor(handle: number, model: number, entityType: number, netId: number | null) {
        super();
        this.handle     = handle;
        this.model      = model;
        this.entityType = entityType;
        this.netId      = netId;
    }
}
