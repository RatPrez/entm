import type { EntityId } from "@entm/base";

const k_poolInvalid: number = -1;

export interface IComponentPool
{
    has(id: EntityId): boolean;
    removeById(id: EntityId): void;
    clear(): void;
}

export class ComponentPool<T> implements IComponentPool
{
// public
    constructor() {
        this.m_denseEntities = [];
        this.m_denseComponents = [];
    }

    emplace(id: EntityId, component: T): T {
        if (id >= this.m_sparse.length) {
            const oldLen = this.m_sparse.length;
            this.m_sparse.length = id + 1;
            this.m_sparse.fill(k_poolInvalid, oldLen);
        }

        if (this.m_sparse[id] !== k_poolInvalid) {
            return this.m_denseComponents[this.m_sparse[id]!]!;
        }


        const index = this.m_denseEntities.length;
        this.m_denseEntities.push(id);
        this.m_denseComponents.push(component);
        this.m_sparse[id] = index;

        return this.m_denseComponents[index]!;
    }

    get(id: EntityId): T | null {
        if (id >= this.m_sparse.length) {
            return null;
        }
        const index: number = this.m_sparse[id]!;
        if (index === k_poolInvalid) {
            return null;
        }
        return this.m_denseComponents[index]!;
    }

    has(id: EntityId): boolean {
        return id < this.m_sparse.length && this.m_sparse[id] != k_poolInvalid;
    }

    removeById(id: EntityId): void {
        if (!this.has(id)) return;

        const index = this.m_sparse[id]!;
        const last = this.m_denseComponents.length - 1;

        if (index !== last) {
            const lastEnt = this.m_denseEntities[last]!;
            this.m_denseEntities[index] = this.m_denseEntities[last]!;
            this.m_denseComponents[index] = this.m_denseComponents[last]!;
            this.m_sparse[lastEnt] = index;
        }

        this.m_sparse[id] = k_poolInvalid;
        this.m_denseEntities.pop();
        this.m_denseComponents.pop();
    }

    clear(): void {
        this.m_denseEntities = [];
        this.m_denseComponents = [];
        this.m_sparse.fill(k_poolInvalid);
    }

    public size(): number {
        return this.m_denseEntities.length;
    }

    public entityAt(i: number): EntityId {
        return this.m_denseEntities[i]!;
    }

    public at(i: number): T {
        return this.m_denseComponents[i]!;
    }

// private
    private m_denseEntities: EntityId[];
    private m_denseComponents: T[];
    private m_sparse: number[] = [];
}
