export interface ParentDataModifier {
    modifyParentData(parentData: unknown): unknown
}

const symbol = Symbol()
ParentDataModifier.symbol = symbol
ParentDataModifier.of = (o: unknown): ParentDataModifier | null => {
    if (!o || typeof o !== 'object' || !(ParentDataModifier.symbol in o)) return null
    return o[ParentDataModifier.symbol] as ParentDataModifier
}

export function ParentDataModifier(modifyParentData: (parentData: unknown) => unknown): unknown {
    return new ParentDataModifierImpl(modifyParentData)
}

class ParentDataModifierImpl implements ParentDataModifier {
    [ParentDataModifier.symbol] = this;

    constructor(
        public modifyParentData: (parentData: unknown) => unknown
    ) {}
}
