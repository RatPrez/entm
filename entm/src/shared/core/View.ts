import type { Component, EntityId } from "@entm/base";
import type { World } from "./World";

export type ViewResult<T extends Component[]> =
    { entityId: EntityId } &
    { [K in T[number] as K['sType']]: K };

export class View<T extends Component[] = Component[]>
{
// public
    constructor(world: World, ...componentNames: string[])
    {
        this.m_world          = world;
        this.m_componentNames = componentNames;
    }

    *[Symbol.iterator](): Generator<ViewResult<T>>
    {
        const [primary, ...rest] = this.m_componentNames;

        if (!primary) return;

        const primaryPool = this.m_world.getPool(primary);

        if (!primaryPool) return;

        for (let i = 0; i < primaryPool.size(); i++)
        {
            const entityId = primaryPool.entityAt(i);

            const result: any =
            {
                entityId,
                [primary]: primaryPool.at(i)
            };

            let valid = true;
            for (const name of rest)
            {
                const comp = this.m_world.getComponent(entityId, name);
                if (comp === null) { valid = false; break; }
                result[name] = comp;
            }

            if (!valid) continue;

            yield result as ViewResult<T>;
        }
    }

    each(fn: (result: ViewResult<T>) => void): void {
        const [primary, ...rest] = this.m_componentNames;

        if (!primary) return;

        const primaryPool = this.m_world.getPool(primary);

        if (!primaryPool) return;

        for (let i = 0; i < primaryPool.size(); i++) {
            const entityId = primaryPool.entityAt(i);

            const result: any = { entityId, [primary]: primaryPool.at(i) };

            let valid = true;
            for (const name of rest) {
                const comp = this.m_world.getComponent(entityId, name);
                if (comp === null) { valid = false; break; }
                result[name] = comp;
            }

            if (valid) fn(result as ViewResult<T>);
        }
    }

// private
    private m_world:          World;
    private m_componentNames: string[];
}
