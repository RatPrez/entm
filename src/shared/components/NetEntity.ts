import { Component } from "../core/Component";

export class NetEntity extends Component {
    readonly netId: number;

    constructor(netId: number) {
        super();
        this.netId = netId;
    }
}
