
class Maps {
    public map: Map<string, boolean>;

    constructor () {
        this.map = new Map<string, boolean>();
    }

    add(email: string, bool: boolean): true {
        this.map.set(email, bool);

        return true;
    }

    has(email: string): boolean {
        return this.map.has(email);
    }

    get(email: string) {
        return this.map.get(email);
    }
}

const map = new Maps();
export default map;