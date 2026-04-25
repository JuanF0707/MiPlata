class Movimiento {
    static idCounter = 0;

    constructor(tipo, valor, fecha, saldoPosterior, descripcion) {
        this.id = ++Movimiento.idCounter;
        this.tipo = tipo;
        this.valor = valor;
        this.fecha = fecha; 
        this.saldoPosterior = saldoPosterior;
        this.descripcion = descripcion;
    }
}

export default Movimiento;