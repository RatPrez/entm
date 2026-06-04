import { toCamelCase } from "./Utils";

export abstract class Component {
    get sType(): string {
        return toCamelCase(this.constructor.name);
    }
}
