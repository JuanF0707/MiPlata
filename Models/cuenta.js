import Movimiento from './movimiento.js';
import EstadoCuenta from './estadoCuenta.js';
import TipoMovimiento from './tipoMovimiento.js';

class Cuenta {
    constructor(fechaApertura, numeroCuenta, saldo, estado,movimientos) {
        this.fechaApertura = fechaApertura;
        this.numeroCuenta = numeroCuenta;
        this.saldo = saldo;
        this.estado = estado;
        this.movimientos = movimientos;
    }


    consultarSaldo() {
        return this.saldo;
    }

    consignar(valor) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            this.saldo += valor;
            this.movimientos.push(new Movimiento(TipoMovimiento.CONSIGNACION, valor, new Date(), this.saldo, "Consignación realizada"));
        } else {
            console.log("La cuenta no está activa. No se puede consignar.");
        }
    }

    retirar(valor) {
        if (this.estado === EstadoCuenta.ACTIVA) {
            if (valor <= this.saldo) {
                this.saldo -= valor;
                this.movimientos.push(new Movimiento(TipoMovimiento.RETIRO, valor, new Date(), this.saldo, "Retiro realizado"));
            } else {
                console.log("Saldo insuficiente para realizar el retiro.");
            }
        } else {
            console.log("La cuenta no está activa. No se puede retirar.");
        }
    }

    obtenerMovimientos() {
        return this.movimientos;
    }

    registrarMovimiento(tipo, valor) {
        this.movimientos.push(new Movimiento(tipo, valor, new Date(), this.saldo, "Movimiento registrado"));
    }

    validarDestino(cuentaDestino) {
        if (this.numeroCuenta === cuentaDestino.numeroCuenta) {
            console.log("No se puede transferir al mismo producto.");
            return false;
        }
        if (cuentaDestino.estado !== EstadoCuenta.ACTIVA) {
            console.log("La cuenta destino no está activa. No se puede transferir.");
            return false;
        }
        return true;
    }

}

export default Cuenta;