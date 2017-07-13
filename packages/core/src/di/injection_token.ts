export class OqaqueToken{
    constructor(protected _desc: string) { }

    toString(): string { return `Token ${this._desc}` }
}

export class InjectionToken<T> extends OqaqueToken{
    private _differentiate_from_OpaqeToken_structurally:any;
    constructor(desc: string) { super(desc) }

    toString() { return `InjectionToken ${this._desc}` }
}