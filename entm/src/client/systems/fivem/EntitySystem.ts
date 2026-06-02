import { System } from "../../../shared/core/System";
import { Logger } from "../../../shared/core/Logger";
import type { EntityId, CfxEntity, Ped, Vehicle } from "@entm/base";

const Delay  = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));
const logger = new Logger("EntitySystem");

export class EntitySystem extends System
{
// public
    override onStart(): void {
        logger.log("started");
    }

    override onEnd(): void {
        logger.log("ended");
        for (const { entityId, cfxEntity } of this.m_world.view<CfxEntity>("cfxEntity")) {
            this.despawn(entityId, cfxEntity.handle);
        }
    }

    override onEntityDestroyed(id: EntityId): void {
        const cfx = this.m_world.getComponent<CfxEntity>(id, "cfxEntity");
        if (!cfx) return;

        if (DoesEntityExist(cfx.handle))
        {
            DeleteEntity(cfx.handle);
            logger.log(`entity ${id} destroyed, deleted cfx handle ${cfx.handle}`);
        }
    }

    override onComponentRemoved(id: EntityId, sType: string): void {
        if (sType == "ped" || sType == "vehicle") {
            const cfx = this.m_world.getComponent<CfxEntity>(id, "cfxEntity");
            if (!cfx) return;
            this.despawn(id, cfx.handle);
        }
    }

    override updateFixed(fixedTime: number): void {
        for (const { entityId, ped } of this.m_world.view<Ped>("ped")) {
            const cfx = this.m_world.getComponent<CfxEntity>(entityId, "cfxEntity");

            if (this.m_pendingSpawns.has(entityId)) continue;

            if (!cfx) {
                this.spawnPed(entityId, ped);
                continue;
            }

            if (!DoesEntityExist(cfx.handle)) {
                logger.error(`ped entity ${entityId} has invalid handle ${cfx.handle}, respawning`);
                this.despawn(entityId, cfx.handle);
                this.spawnPed(entityId, ped);
                continue;
            }

            if (cfx.model !== ped.model) {
                logger.log(`ped entity ${entityId} model changed (${cfx.model} -> ${ped.model}), respawning`);
                this.despawn(entityId, cfx.handle);
                this.spawnPed(entityId, ped);
            }
        }

        for (const { entityId, vehicle } of this.m_world.view<Vehicle>("vehicle")) {
            const cfx = this.m_world.getComponent<CfxEntity>(entityId, "cfxEntity");

            if (this.m_pendingSpawns.has(entityId)) continue;

            if (!cfx) {
                this.spawnVehicle(entityId, vehicle);
                continue;
            }

            if (!DoesEntityExist(cfx.handle)) {
                logger.error(`vehicle entity ${entityId} has invalid handle ${cfx.handle}, respawning`);
                this.despawn(entityId, cfx.handle);
                this.spawnVehicle(entityId, vehicle);
                continue;
            }

            if (cfx.model !== vehicle.model) {
                logger.log(`vehicle entity ${entityId} model changed (${cfx.model} -> ${vehicle.model}), respawning`);
                this.despawn(entityId, cfx.handle);
                this.spawnVehicle(entityId, vehicle);
            }
        }
    }

// private
    private async spawnPed(id: EntityId, ped: Ped): Promise<void> {
        this.m_pendingSpawns.add(id);
        logger.log(`spawning ped entity ${id} with model ${ped.model}`);

        RequestModel(ped.model);
        while (!HasModelLoaded(ped.model)) await Delay(10);

        const handle = CreatePed(4, ped.model, ped.position.x, ped.position.y, ped.position.z, ped.rotation.y, false, false);

        if (!DoesEntityExist(handle)) {
            logger.error(`CreatePed failed for entity ${id} with model ${ped.model}`);
            this.m_pendingSpawns.delete(id);
            return;
        }

        this.m_world.addComponent<CfxEntity>(id, { sType: "cfxEntity", handle, model: ped.model, entityType: "ped", netId: null });
        SetModelAsNoLongerNeeded(ped.model);

        logger.log(`ped entity ${id} spawned with handle ${handle}`);
        this.m_pendingSpawns.delete(id);
    }

    private async spawnVehicle(id: EntityId, vehicle: Vehicle): Promise<void> {
        this.m_pendingSpawns.add(id);
        logger.log(`spawning vehicle entity ${id} with model ${vehicle.model}`);

        RequestModel(vehicle.model);
        while (!HasModelLoaded(vehicle.model)) await Delay(10);

        const handle = CreateVehicle(vehicle.model, vehicle.position.x, vehicle.position.y, vehicle.position.z, vehicle.rotation.y, false, false);

        if (!DoesEntityExist(handle)) {
            logger.error(`CreateVehicle failed for entity ${id} with model ${vehicle.model}`);
            this.m_pendingSpawns.delete(id);
            return;
        }

        this.m_world.addComponent<CfxEntity>(id, { sType: "cfxEntity", handle, model: vehicle.model, entityType: "vehicle", netId: null });
        SetModelAsNoLongerNeeded(vehicle.model);

        logger.log(`vehicle entity ${id} spawned with handle ${handle}`);
        this.m_pendingSpawns.delete(id);
    }

    private despawn(id: EntityId, handle: number): void {
        if (DoesEntityExist(handle)) {
            DeleteEntity(handle);
            logger.log(`despawned entity ${id} (handle ${handle})`);
        }
        this.m_world.removeComponent(id, "cfxEntity");
    }

    private m_pendingSpawns: Set<EntityId> = new Set();
}
