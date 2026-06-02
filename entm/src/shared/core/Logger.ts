export class Logger
{
    constructor(private m_tag: string) {}

    log(msg: string): void
    {
        if (GetConvar("sv_debug", "false") !== "true") return;
        console.log(`[${this.m_tag}] ${msg}`);
    }

    warn(msg: string): void
    {
        if (GetConvar("sv_debug", "false") !== "true") return;
        console.warn(`[${this.m_tag}] ${msg}`);
    }

    error(msg: string): void
    {
        console.error(`[${this.m_tag}] ${msg}`);
    }
}
