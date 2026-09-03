export interface ParentDataModifier {
    modifyParentData(parentData: unknown): unknown
}

const symbol = Symbol()
ParentDataModifier.symbol = symbol
ParentDataModifier.is = (o: unknown): o is { [ParentDataModifier.symbol]: ParentDataModifier } =>
    !(!o || typeof o !== 'object' || !(ParentDataModifier.symbol in o))
ParentDataModifier.of = (o: unknown): ParentDataModifier | null =>
    ParentDataModifier.is(o) ? o[ParentDataModifier.symbol] : null

export function ParentDataModifier(modifyParentData: (parentData: unknown) => unknown): unknown {
    return new ParentDataModifierImpl(modifyParentData)
}

class ParentDataModifierImpl implements ParentDataModifier {
    [ParentDataModifier.symbol] = this

    constructor(
        public modifyParentData: (parentData: unknown) => unknown
    ) {}
}
