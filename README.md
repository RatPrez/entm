# @ratprez/entm

TypeScript ECS (Entity Component System) framework package for FiveM. This is the base package - it provides the core classes, component types, and math utilities used by [entm-core](https://github.com/RatPrez/entm-core) and any module built on top of it.

> This package is a companion to `entm-core`. It is **not** a standalone FiveM resource. Install it as a dev dependency in your module projects.

## Installation

```bash
npm install @ratprez/entm
```

## What's included

### Core ECS
| Export | Description |
|---|---|
| `World` | Manages entities, components, and systems |
| `System` | Base class to extend for your own systems |
| `View` | Iterates entities matching a set of component types |
| `ComponentPool` | Sparse set storage for a single component type |
| `Component` | Abstract base class for all components |
| `Profiler` | Frame-time measurement for systems |

### Components
| Export | Description |
|---|---|
| `EntityComponent` | Abstract base for spawnable FiveM entities |
| `CfxEntity` | Holds a live FiveM entity handle |
| `Ped` | Client-side ped component |
| `Vehicle` | Client-side vehicle component |
| `Transform` | Position, rotation, scale |

### Math
| Export | Description |
|---|---|
| `vec3` | Construct a `Vec3` from values or a coords array |
| `vec3Add` `vec3Sub` `vec3Scale` `vec3Len` | Common vector operations |

### Decorators
| Export | Description |
|---|---|
| `@shared` | Marks a component class as shared across modules |

## Usage

```ts
import { System, Component, vec3 } from "@ratprez/entm";
import type { World } from "@ratprez/entm";

class Health extends Component {
    readonly sType = "health" as const;
    current: number;
    max:     number;

    constructor(max: number) {
        super();
        this.current = max;
        this.max     = max;
    }
}

class HealthSystem extends System {
    override update(dt: number): void {
        for (const { health } of this.m_world.view(Health)) {
            // your logic here
        }
    }
}

declare function __registerModule(init: (world: World) => void): void;

__registerModule((world) => {
    world.addSystem(new HealthSystem(world));
});
```

## License

ISC
