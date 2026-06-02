import type { Component } from "../core/Component";
import type { EntityId } from "../core/Entity";

type ViewResult = Record<string, unknown> & { entityId: EntityId };

const _ex = () => (globalThis as any).exports["entm"];

export const entm = {
    createEntity:  (): EntityId                                        => _ex().createEntity(),
    destroyEntity: (id: EntityId): void                                => _ex().destroyEntity(id),
    hasEntity:     (id: EntityId): boolean                             => _ex().hasEntity(id),
    getEntityCount: (): number                                         => _ex().getEntityCount(),
    addComponent:  <T extends Component>(id: EntityId, c: T): T       => _ex().addComponent(id, c),
    getComponent:  <T extends Component>(id: EntityId, sType: string): T | null => _ex().getComponent(id, sType),
    removeComponent: (id: EntityId, sType: string): void              => _ex().removeComponent(id, sType),
    view:          (...sTypes: string[]): ViewResult[]                 => _ex().view(...sTypes),
};
