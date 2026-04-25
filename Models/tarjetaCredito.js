import Cuenta from './cuenta.js';
import EstadoCuenta from './estadoCuenta.js';
import TipoMovimiento from './tipoMovimiento.js';
import Movimiento from './movimiento.js';

class TarjetaCredito extends Cuenta {
    constructor(fechaApertura, numeroCuenta, saldo, estado, movimientos, cupo, deuda, numeroCuotas){
        super(fechaApertura, numeroCuenta, saldo, estado, movimientos);
        this.cupo = cupo;
        this.deuda = deuda;
        this.numeroCuotas = numeroCuotas;
    }

    consignar(valor) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            const pagoReal = Math.min(valor, this.deuda)
            this.deuda -= pagoReal
            this.movimientos.push(new Movimiento(
                TipoMovimiento.PAGO_TC,
                pagoReal,
                new Date(),
                this.cupo - this.deuda,
                'Pago recibido por transferencia'
            ))
        }
    }

    retirar(valor, cuotas = 12) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            const saldoDisponible = this.cupo - this.deuda;
            if (valor <= saldoDisponible) {
                const tasa = 0.023
                const cuotaMensual = (valor * tasa) / (1 - Math.pow(1 + tasa, -cuotas))
                const totalDeuda = cuotaMensual * cuotas
                this.deuda += totalDeuda;
                this.movimientos.push(new Movimiento(TipoMovimiento.RETIRO, totalDeuda, new Date(), this.cupo - this.deuda, `Avance en efectivo a ${cuotas} cuotas. Cuota: $${cuotaMensual.toFixed(2)}`));
                return cuotaMensual
            } else {
                console.log("Cupo insuficiente para realizar el retiro.");
            }
        } else {
            console.log("La tarjeta no está activa. No se puede retirar.");
        }
    }

    comprar(valor, cuotas) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            const saldoDisponible = this.cupo - this.deuda;

            if (valor > saldoDisponible) {
                console.log("Cupo insuficiente.");
                return;
            }

            // Calcular la cuota de esta compra con sus propias cuotas
            const cuotaMensual = this.calcularCuotaMensual(valor, cuotas);
            
            this.deuda += cuotaMensual * cuotas;

            this.movimientos.push(new Movimiento(
                TipoMovimiento.COMPRA_TC,
                valor,
                new Date(),
                this.cupo - this.deuda,
                `Compra a ${cuotas} cuotas. Cuota mensual: $${cuotaMensual.toFixed(2)}`
            ));

            console.log(`Cuota mensual: $${cuotaMensual.toFixed(2)}`);
            return cuotaMensual;
        }
    }

    pagar(valor) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            if (valor <= this.deuda) {
                this.deuda -= valor;
                this.movimientos.push(new Movimiento(TipoMovimiento.PAGO_TC, valor, new Date(), this.cupo - this.deuda, "Pago realizado"));
            } else {
                console.log("El valor del pago excede la deuda actual.");
            }
        } else {
            console.log("La tarjeta no está activa. No se puede realizar el pago.");
        }
    }

    calcularTasaInteres(cuotas) {
        if (cuotas <= 2) return 0;
        if (cuotas <= 6) return 0.019;
        return 0.023;
    }

    calcularCuotaMensual(valor, cuotas) {
        const tasa = this.calcularTasaInteres(cuotas);
        if (tasa === 0) return valor / cuotas;
        return (valor * tasa) / (1 - Math.pow(1 + tasa, -cuotas));
    }

    transferir(valor, cuentaDestino) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            if (!this.validarDestino(cuentaDestino)) return;
            const saldoDisponible = this.cupo - this.deuda;
            if (valor <= saldoDisponible) {
                this.deuda += valor;
                cuentaDestino.consignar(valor);
                this.movimientos.push(new Movimiento(TipoMovimiento.TRANSFERENCIA_OUT, valor, new Date(), this.cupo - this.deuda, "Transferencia realizada"));
            } else {
                console.log("Cupo insuficiente para realizar la transferencia.");
            }
        } else {
            console.log("La tarjeta no está activa. No se puede transferir.");
        }
    }
}

export default TarjetaCredito;