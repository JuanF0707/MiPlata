import Movimiento from './movimiento.js';
import EstadoCuenta from './estadoCuenta.js';
import TipoMovimiento from './tipoMovimiento.js';
import Cuenta from './cuenta.js';

class CuentaCorriente extends Cuenta {
    constructor(fechaApertura, numeroCuenta, saldo, estado, movimientos) {
        super(fechaApertura, numeroCuenta, saldo, estado, movimientos);
    }

    retirar(valor) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            const saldoDisponible = this.saldo * 1.20;
            if (valor <= saldoDisponible) {
                this.saldo -= valor;
                this.movimientos.push(new Movimiento(TipoMovimiento.RETIRO, valor, new Date(), this.saldo, "Retiro realizado"));
            } else {
                console.log("Saldo insuficiente para realizar el retiro, incluso con el 20% del sobregiro.");
            }
        } else {
            console.log("La cuenta no está activa. No se puede retirar.");
        }
    }

    calcularInteresSobregiro() {
        if (this.saldo < 0) {
            return Math.abs(this.saldo) * this.porcentajeSobregiro;
        }
        return 0;
    }

    transferir(valor, cuentaDestino) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            if (!this.validarDestino(cuentaDestino)) return;
            const saldoDisponible = this.saldo * 1.20;
            if (valor <= saldoDisponible) {
                this.saldo -= valor;
                cuentaDestino.consignar(valor);
                this.movimientos.push(new Movimiento(TipoMovimiento.TRANSFERENCIA_OUT, valor, new Date(), this.saldo, "Transferencia realizada"));
            } else {
                console.log("Saldo insuficiente para realizar la transferencia, incluso con el sobregiro.");
            }
        } else {
            console.log("La cuenta no está activa. No se puede transferir.");
        }
    }
}

export default CuentaCorriente;