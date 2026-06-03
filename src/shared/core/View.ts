import type { Component } from "./Component";
import type { EntityId }  from "./Entity";
import type { World }     from "./World";

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
        const [primaryCtor, ...restCtors] = this.m_ctors;
        if (!primaryCtor) return;

        const primaryPool = this.m_world.getPool(primaryCtor);
        if (!primaryPool) return;

        for (let i = 0; i < primaryPool.size(); i++) {
            const entityId    = primaryPool.entityAt(i);
            const primaryComp = primaryPool.at(i);
            const result: any = { entityId, [primaryComp.sType]: primaryComp };

            let valid = true;
            for (const ctor of restCtors) {
                const comp = this.m_world.getComponent(entityId, ctor);
                if (comp === null) { valid = false; break; }
                result[comp.sType] = comp;
            }

            if (!valid) continue;
            yield result as ViewResult<T>;
        }
    }

    each(fn: (result: ViewResult<T>) => void): void {
        const [primaryCtor, ...restCtors] = this.m_ctors;
        if (!primaryCtor) return;

        const primaryPool = this.m_world.getPool(primaryCtor);
        if (!primaryPool) return;

        for (let i = 0; i < primaryPool.size(); i++) {
            const entityId    = primaryPool.entityAt(i);
            const primaryComp = primaryPool.at(i);
            const result: any = { entityId, [primaryComp.sType]: primaryComp };

            let valid = true;
            for (const ctor of restCtors) {
                const comp = this.m_world.getComponent(entityId, ctor);
                if (comp === null) { valid = false; break; }
                result[comp.sType] = comp;
            }

            if (valid) fn(result as ViewResult<T>);
        }
    }

// private
    private m_world: World;
    private m_ctors: (new (...args: any[]) => Component)[];
}
