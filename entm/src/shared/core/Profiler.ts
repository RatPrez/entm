export interface ProfileStat
{
    name:     string;
    updateMs: number;
    fixedMs:  number;
}

export class Profiler
{
// public
    measure(name: string, type: "update" | "fixed", fn: () => void): void
    {
        const start   = Date.now();
        fn();
        const elapsed = Date.now() - start;

        if (!this.m_stats.has(name))
            this.m_stats.set(name, { name, updateMs: 0, fixedMs: 0 });

        const stat = this.m_stats.get(name)!;

        if (type === "update") stat.updateMs = stat.updateMs * 0.9 + elapsed * 0.1;
        else                   stat.fixedMs  = stat.fixedMs  * 0.9 + elapsed * 0.1;
    }

    getSorted(): ProfileStat[]
    {
        return Array.from(this.m_stats.values())
            .sort((a, b) => (b.updateMs + b.fixedMs) - (a.updateMs + a.fixedMs));
    }

// private
    private m_stats: Map<string, ProfileStat> = new Map();
}
