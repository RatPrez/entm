import type { Component }                from "./Component";
import type { EntityId }                 from "./Entity";
import { PlayerData }                    from "../components/PlayerData";
import { ComponentPool, IComponentPool } from "./ComponentPool";
import { System }                        from "./System";
import { View }                          from "./View";
import { Profiler }                      from "./Profiler";
import { SyncQueue }                     from "./SyncQueue";
import { toCamelCase, compareClass }     from "./Utils";

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

        if (IsDuplicityVersion()) {
            // server
            onNet("__int_entm::ready", () => this.initPlayer(source));
            on("playerDropped", () => this.destroyPlayer(source));

        } else {
            // client
            onNet("__int_entm::playerLoaded", (entityId: number) => {
                console.log(`m_localEntityId: ${entityId}`);
                this.m_localEntityId = entityId;
            });

            emitNet("__int_entm::ready");
        }

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

    createEntity(synced: boolean = false): EntityId {
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

        if (synced && IsDuplicityVersion()) {
            for (const system of this.m_systems.values()) {
                if (system.m_hasOnNetEntityCreated) system.onNetEntityCreated(id);
            }
        }

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

        for (const [ctor, pool] of this.m_componentPools.entries()) {
            if (!pool.has(id)) continue;

            const component = (pool as ComponentPool<Component>).get(id);
            const isNet = compareClass(component?.sType, "netEntity");

            if (isNet) {
                for (const system of this.m_systems.values()) {
                    if (system.m_hasOnNetEntityDestroyed) {
                        system.onNetEntityDestroyed(id);
                    }
                }
            } else if (component) {
                for (const system of this.m_systems.values()) {
                    if (system.m_hasOnComponentRemoved) {
                        system.onComponentRemoved(id, component.sType);
                    }
                }
            }
        }

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

        if ((ctor as any).sync === 'full') {
            component = this.syncQueue.addComponentSync(id, component);
        }

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

        const sType = toCamelCase(ctor.name);
        const isNet = compareClass(sType, "netEntity");

        if (isNet) {
            for (const system of this.m_systems.values()) {
                if (system.m_hasOnNetEntityDestroyed) {
                    system.onNetEntityDestroyed(id);
                }
            }
        } else {
            for (const system of this.m_systems.values()) {
                if (system.m_hasOnComponentRemoved) {
                    system.onComponentRemoved(id, sType);
                }
            }
        }

        pool.removeById(id);
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
        system.m_hasOnNetEntityCreated    = system.onNetEntityCreated    !== System.prototype.onNetEntityCreated;
        system.m_hasOnNetEntityDestroyed  = system.onNetEntityDestroyed  !== System.prototype.onNetEntityDestroyed;
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

    /// --- FiveM Specific ---

    getLocalPlayerEntityId(): EntityId | null {
        if (IsDuplicityVersion()) {
            // warn log here, is client only method
            return null;
        }
        return this.m_localEntityId;
    }

    getEntityIdFromLocalPlayer(source: number): EntityId | null {
        if (IsDuplicityVersion()) {
            // warn log here, is client only method
            return null;
        }
        return this.getEntityIdFromSource(GetPlayerServerId(source));
    }

    getEntityIdFromSource(source: number): EntityId | null {
        if (IsDuplicityVersion()) {
            return this.m_playerToEntity.get(source) ?? null;
        }
        for (const { entityId, playerData } of this.view(PlayerData)) {
            if (playerData.source == source) { // == intentional, FiveM may pass source as string because fuck knows why
                return entityId;
            }
        }
        return null;
    }

    getSourceFromEntityId(entityId: EntityId): number | null {
        if (IsDuplicityVersion()) {
            return this.m_entityToPlayer.get(entityId) ?? null;
        }
        return this.getComponent(entityId, PlayerData)?.source ?? null;
    }

    isEntityAPlayer(entityId: EntityId): boolean {
        return this.getSourceFromEntityId(entityId) !== null;
    }

    public syncQueue:               SyncQueue = new SyncQueue();

// private
    private m_nextEntityId:         number = 1;
    private m_sparse:               number[] = [];
    private m_dense:                EntityId[] = [];
    private m_freeIds:              EntityId[] = [];

    private m_profiler:             Profiler | null = null;
    private m_systems:              Map<new (...args: any[]) => System, System> = new Map();
    private m_componentPools:       Map<Function, IComponentPool> = new Map();
    private m_playerToEntity:       Map<number, EntityId> = new Map();
    private m_entityToPlayer:       Map<EntityId, number> = new Map();
    private m_localEntityId:        EntityId | null = null;

    private initPlayer(source: number): void {
        console.log(source);

        if (this.m_playerToEntity.has(source)) return;

        const entityId = this.createEntity(true);
        this.addComponent(entityId, new PlayerData(source, GetPlayerName(source)));

        this.m_playerToEntity.set(source, entityId);
        this.m_entityToPlayer.set(entityId, source);

        emitNet("__int_entm::playerLoaded", source, entityId);
        emit("__int_entm::playerLoaded", source, entityId);
    }

    private destroyPlayer(source: number): void {
        const entityId = this.m_playerToEntity.get(source);
        if (entityId === undefined) { return; }
        this.destroyEntity(entityId);
        this.m_playerToEntity.delete(source);
        this.m_entityToPlayer.delete(entityId);
    }

}
