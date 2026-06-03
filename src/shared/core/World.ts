import type { Component }                from "./Component";
import type { EntityId }                from "./Entity";
import { ComponentPool, IComponentPool } from "./ComponentPool";
import { System }                        from "./System";
import { View }                          from "./View";
import { Profiler }                      from "./Profiler";

const k_entityInvalid = -1;

export class World {
// public
    constructor() {
        on("onResourceStop", (resourceName: string) => {
            if (resourceName !== GetCurrentResourceName()) return;
            for (const system of this.m_systems.values()) {
                if (system.m_hasOnEnd) system.onEnd();
            }
        });
    }

    setProfiler(profiler: Profiler): void {
        this.m_profiler = profiler;
    }

    update(deltaTime: number): void {
        for (const system of this.m_systems.values()) {
            if (!system.m_hasUpdate) continue;
            try {
                if (this.m_profiler) {
                    this.m_profiler.measure(system.constructor.name, "update", () => system.update(deltaTime));
                } else {
                    system.update(deltaTime);
                }
            } catch (e) {
                console.error(`[entm] error in ${system.constructor.name}.update: ${e}`);
            }
        }
    }

    updateFixed(fixedTime: number): void {
        for (const system of this.m_systems.values()) {
            if (!system.m_hasFixedUpdate) continue;
            try {
                if (this.m_profiler) {
                    this.m_profiler.measure(system.constructor.name, "fixed", () => system.updateFixed(fixedTime));
                } else {
                    system.updateFixed(fixedTime);
                }
            } catch (e) {
                console.error(`[entm] error in ${system.constructor.name}.updateFixed: ${e}`);
            }
        }
    }

    /// --- entities ---

    createEntity(): EntityId {
        let id: EntityId;

        if (this.m_freeIds.length > 0) {
            id = this.m_freeIds.pop()!;
        } else {
            id = this.m_nextEntityId++;
            this.m_sparse.push(k_entityInvalid);
        }

        const index = this.m_dense.length;
        this.m_dense.push(id);
        this.m_sparse[id] = index;

        for (const system of this.m_systems.values()) {
            if (system.m_hasOnEntityCreated) system.onEntityCreated(id);
        }

        return id;
    }

    destroyEntity(id: EntityId): void {
        for (const system of this.m_systems.values()) {
            if (system.m_hasOnEntityDestroyed) system.onEntityDestroyed(id);
        }

        const index = this.m_sparse[id]!;
        const last  = this.m_dense.length - 1;

        if (index !== last) {
            const lastId = this.m_dense[last]!;
            this.m_dense[index]   = lastId;
            this.m_sparse[lastId] = index;
        }

        this.m_dense.pop();
        this.m_sparse[id] = k_entityInvalid;

        for (const pool of this.m_componentPools.values()) {
            pool.removeById(id);
        }

        this.m_freeIds.push(id);
    }

    hasEntity(id: EntityId): boolean {
        return id < this.m_sparse.length && this.m_sparse[id] !== k_entityInvalid;
    }

    getEntityCount(): number {
        return this.m_dense.length;
    }

    /// --- components ---

    addComponent<T extends Component>(id: EntityId, component: T): T {
        const ctor = component.constructor as new (...args: any[]) => T;

        if (!this.m_componentPools.has(ctor)) {
            this.m_componentPools.set(ctor, new ComponentPool<T>());
        }

        const result = (this.m_componentPools.get(ctor) as ComponentPool<T>).emplace(id, component);

        for (const system of this.m_systems.values()) {
            if (system.m_hasOnComponentAdded) system.onComponentAdded(id, component.sType);
        }

        return result;
    }

    getComponent<T extends Component>(id: EntityId, ctor: new (...args: any[]) => T): T | null {
        return (this.m_componentPools.get(ctor) as ComponentPool<T> | undefined)?.get(id) ?? null;
    }

    removeComponent<T extends Component>(id: EntityId, ctor: new (...args: any[]) => T): void {
        const pool = this.m_componentPools.get(ctor);
        if (!pool?.has(id)) return;

        pool.removeById(id);

        const sType = ctor.name.charAt(0).toLowerCase() + ctor.name.slice(1);
        for (const system of this.m_systems.values()) {
            if (system.m_hasOnComponentRemoved) system.onComponentRemoved(id, sType);
        }
    }

    getPool<T extends Component>(ctor: new (...args: any[]) => T): ComponentPool<T> | null {
        return (this.m_componentPools.get(ctor) as ComponentPool<T>) ?? null;
    }

    view<A extends Component>(a: new (...args: any[]) => A): View<[A]>;
    view<A extends Component, B extends Component>(a: new (...args: any[]) => A, b: new (...args: any[]) => B): View<[A, B]>;
    view<A extends Component, B extends Component, C extends Component>(a: new (...args: any[]) => A, b: new (...args: any[]) => B, c: new (...args: any[]) => C): View<[A, B, C]>;
    view<A extends Component, B extends Component, C extends Component, D extends Component>(a: new (...args: any[]) => A, b: new (...args: any[]) => B, c: new (...args: any[]) => C, d: new (...args: any[]) => D): View<[A, B, C, D]>;
    view(...ctors: (new (...args: any[]) => Component)[]): View<Component[]> {
        return new View(this, ...ctors);
    }

    /// --- systems ---

    addSystem(system: System): void {
        system.m_hasUpdate             = system.update             !== System.prototype.update;
        system.m_hasFixedUpdate        = system.updateFixed        !== System.prototype.updateFixed;
        system.m_hasOnStart            = system.onStart            !== System.prototype.onStart;
        system.m_hasOnEnd              = system.onEnd              !== System.prototype.onEnd;
        system.m_hasOnEntityCreated    = system.onEntityCreated    !== System.prototype.onEntityCreated;
        system.m_hasOnEntityDestroyed  = system.onEntityDestroyed  !== System.prototype.onEntityDestroyed;
        system.m_hasOnComponentAdded   = system.onComponentAdded   !== System.prototype.onComponentAdded;
        system.m_hasOnComponentRemoved = system.onComponentRemoved !== System.prototype.onComponentRemoved;

        this.m_systems.set(system.constructor as new (...args: any[]) => System, system);

        if (system.m_hasOnStart) system.onStart();
    }

    removeSystem<T extends System>(ctor: new (...args: any[]) => T): void {
        const system = this.m_systems.get(ctor);
        if (system?.m_hasOnEnd) system.onEnd();
        this.m_systems.delete(ctor);
    }

    getSystem<T extends System>(ctor: new (...args: any[]) => T): T | null {
        return (this.m_systems.get(ctor) as T) ?? null;
    }

// private
    private m_nextEntityId: number = 0;
    private m_sparse:       number[] = [];
    private m_dense:        EntityId[] = [];
    private m_freeIds:      EntityId[] = [];

    private m_profiler:       Profiler | null = null;
    private m_systems:        Map<new (...args: any[]) => System, System> = new Map();
    private m_componentPools: Map<Function, IComponentPool>               = new Map();
}
