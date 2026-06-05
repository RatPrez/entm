export class Logger {
    constructor(tag: string) {
        this.m_tag = tag;
        on("__int_entm::debug_toggle", (state: boolean) => this.m_debug = state);
    }

    setActive(state: boolean): void {
        this.m_debug = state;
    }

    log(msg: string): void {
        if (!this.m_debug) return;
        console.log(`[${this.m_tag}] ${msg}`);
    }

    warn(msg: string): void {
        if (!this.m_debug) return;
        console.warn(`[${this.m_tag}] ${msg}`);
    }

    error(msg: string): void {
        console.error(`[${this.m_tag}] ${msg}`);
    }

// private
    private m_debug: boolean = false;
    private m_tag: string;
}
