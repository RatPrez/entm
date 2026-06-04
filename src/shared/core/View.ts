import type { Component } from "./Component";
import type { EntityId }  from "./Entity";
import type { World }     from "./World";
import { toCamelCase }    from "./Utils";

export type ViewResult<T extends Component[]> =
    { entityId: EntityId } &
    { [K in T[number] as K['sType']]: K };

export class View<T extends Component[] = Component[]> {
// public
    constructor(world: World, ...ctors: (new (...args: any[]) => Component)[]) {
        this.m_world = world;
        this.m_ctors = ctors;
    }

    *[Symbol.iterator](): Generator<ViewResult<T>> {
        yield* this.m_iterate();
    }

    each(fn: (result: ViewResult<T>) => void): void {
        for (const result of this.m_iterate()) {
            fn(result);
        }
    }

// private
    private *m_iterate(): Generator<ViewResult<T>> {
        const [primaryCtor, ...restCtors] = this.m_ctors;
        if (!primaryCtor) { return; }

        const primaryPool = this.m_world.getPool(primaryCtor);
        if (!primaryPool) { return; }

        const primaryKey = this.m_key(primaryCtor);

        for (let i = 0; i < primaryPool.size(); i++) {
            const entityId = primaryPool.entityAt(i);
            const result: any = { entityId, [primaryKey]: primaryPool.at(i) };

            let valid = true;
            for (const ctor of restCtors) {
                const comp = this.m_world.getComponent(entityId, ctor);
                if (comp === null) { valid = false; break; }
                result[this.m_key(ctor)] = comp;
            }

            if (!valid) { continue; }
            yield result as ViewResult<T>;
        }
    }

    private m_key(ctor: new (...args: any[]) => Component): string {
        return toCamelCase(ctor.name);
    }

    private m_world: World;
    private m_ctors: (new (...args: any[]) => Component)[];
}
