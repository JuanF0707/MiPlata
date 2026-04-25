import Movimiento from './movimiento.js';
import EstadoCuenta from './estadoCuenta.js';
import TipoMovimiento from './tipoMovimiento.js';
import Cuenta from './cuenta.js';

class CuentaAhorros extends Cuenta {
    constructor(fechaApertura, numeroCuenta, saldo, estado, movimientos, tasaInteres) {
        super(fechaApertura, numeroCuenta, saldo, estado, movimientos);
        this.tasaInteres = tasaInteres;
    }

    retirar(valor) {
        if (this.estado === EstadoCuenta.ACTIVA) {

            const interes = valor * 0.015;
            const totalADescontar = valor + interes;

            if (totalADescontar > this.saldo) {
                console.log("Saldo insuficiente. Recuerda que se cobra un 1.5% de interés.");
                return;
            }

            this.saldo -= totalADescontar;

            this.movimientos.push(new Movimiento(
                TipoMovimiento.RETIRO,
                valor,
                new Date(),
                this.saldo,
                `Retiro: $${valor} + Interés: $${interes.toFixed(2)}`
            ));

        } else {
            console.log("La cuenta no está activa.");
        }
    }

    aplicarInteres() {
        if (this.estado === EstadoCuenta.ACTIVA) {
            const interes = this.saldo * this.tasaInteres;
            this.saldo += interes;
            this.movimientos.push(new Movimiento(TipoMovimiento.INTERES, interes, new Date(), this.saldo, "Interés aplicado"));
        } else {
            console.log("La cuenta no está activa. No se puede aplicar el interés.");
        }
    }

    calcularInteres() {
        return this.saldo * this.tasaInteres;
    }
    
    transferir(valor, cuentaDestino) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            if (!this.validarDestino(cuentaDestino)) return;
            if (valor <= this.saldo) {
                this.saldo -= valor;
                cuentaDestino.consignar(valor);
                this.movimientos.push(new Movimiento(TipoMovimiento.TRANSFERENCIA_OUT, valor, new Date(), this.saldo, "Transferencia realizada"));
            } else {
                console.log("Saldo insuficiente para realizar la transferencia.");
            }
        } else {
            console.log("La cuenta no está activa. No se puede transferir.");
        }
    }
}

export default CuentaAhorros;