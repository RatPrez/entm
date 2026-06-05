import { Component } from "../core/Component";
import { sync } from "../core/Decorators";

@sync('full')
export class PlayerData extends Component {
    public readonly source: number;
    public readonly name: string;
    constructor(source: number, name: string) {
        super();
        this.source = source;
        this.name = name;
    }
}
