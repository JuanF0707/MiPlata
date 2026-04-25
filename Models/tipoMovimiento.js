const TipoMovimiento = {
    CONSIGNACION: "consignación",
    RETIRO: "retiro",
    TRANSFERENCIA_OUT: "transferencia saliente",
    TRANSFERENCIA_IN: "transferencia entrante",
    COMPRA_TC: "compra tarjeta de crédito",
    PAGO_TC: "pago tarjeta de crédito",
    INTERES: "interés aplicado"
    
};

Object.freeze(TipoMovimiento);

export default TipoMovimiento;
