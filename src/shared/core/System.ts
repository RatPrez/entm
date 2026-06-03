import type { World }    from "./World";
import type { EntityId } from "./Entity";

export class System {
// public
    constructor(world: World) {
        this.m_world = world;
    }

    update(deltaTime: number): void {}
    updateFixed(fixedTime: number): void {}
    onStart(): void {}
    onEnd(): void {}
    onEntityCreated(id: EntityId): void {}
    onEntityDestroyed(id: EntityId): void {}
    onComponentAdded(id: EntityId, sType: string): void {}
    onComponentRemoved(id: EntityId, sType: string): void {}

    m_hasUpdate:             boolean = false;
    m_hasFixedUpdate:        boolean = false;
    m_hasOnStart:            boolean = false;
    m_hasOnEnd:              boolean = false;
    m_hasOnEntityCreated:    boolean = false;
    m_hasOnEntityDestroyed:  boolean = false;
    m_hasOnComponentAdded:   boolean = false;
    m_hasOnComponentRemoved: boolean = false;

// protected
    protected m_world: World;
}
