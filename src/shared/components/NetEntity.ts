import { Component } from "../core/Component";

export class NetEntity extends Component {
    public readonly netId: number;

    constructor(netId: number) {
        super();
        this.netId = netId;
    }
}
