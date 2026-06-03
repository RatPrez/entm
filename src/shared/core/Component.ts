export abstract class Component {
    get sType(): string {
        const n = this.constructor.name;
        return n.charAt(0).toLowerCase() + n.slice(1);
    }
}
