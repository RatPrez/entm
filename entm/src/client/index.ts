import { World } from "../shared/core/World";
import { EntitySystem } from "./systems/fivem/EntitySystem";
import { DebugSystem } from "./systems/DebugSystem";
import { Profiler } from "shared/core/Profiler";

const Delay = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

const k_fixedTimestep   = 1.0 / 30.0;
const k_maxDelta        = 0.25;
const g_world           = new World();
const g_profiler        = new Profiler();

// --- main ---

async function gameLoop(): Promise<void>
{
    let lastTime         = GetGameTimer();
    let fixedAccumulator = 0.0;

    g_world.setProfiler(g_profiler);
    g_world.addSystem(new DebugSystem(g_world, g_profiler));
    g_world.addSystem(new EntitySystem(g_world));

    while (true)
    {
        const now      = GetGameTimer();
        let deltaTime  = (now - lastTime) / 1000.0;
        lastTime       = now;

        deltaTime        = Math.min(deltaTime, k_maxDelta);
        fixedAccumulator += deltaTime;

        while (fixedAccumulator >= k_fixedTimestep)
        {
            g_world.updateFixed(k_fixedTimestep);
            fixedAccumulator -= k_fixedTimestep;
        }

        g_world.update(deltaTime);
        await Delay(0);
    }
}

// --- exports ---

exports("createEntity",   ()                         => g_world.createEntity());
exports("destroyEntity",  (id: number)               => g_world.destroyEntity(id));
exports("hasEntity",      (id: number)               => g_world.hasEntity(id));
exports("getEntityCount", ()                         => g_world.getEntityCount());
exports("addComponent",   (id: number, c: any)       => g_world.addComponent(id, c));
exports("getComponent",   (id: number, sType: string) => g_world.getComponent(id, sType));
exports("removeComponent",(id: number, sType: string) => g_world.removeComponent(id, sType));
exports("view",           (...sTypes: string[])      => {
    const results: any[] = [];
    (g_world as any).view(...sTypes).each((r: any) => results.push(r));
    return results;
});

gameLoop();
