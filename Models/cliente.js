export default class Cliente{

    constructor(id, identificacion, nombre, celular, usuario, contraseña) {
        this.id = id;
        this.identificacion = identificacion;
        this.nombre = nombre;
        this.celular = celular;
        this.usuario = usuario;
        this.contraseña = contraseña;
        this.intentosFallidos = 0;
        this.bloqueado = false;
        this.cuentas = [];
    }

    agregarCuenta(cuenta) {
        this.cuentas.push(cuenta);
    }

    eliminarCuenta(numeroCuenta) {
        const index = this.cuentas.findIndex(c => c.numeroCuenta === numeroCuenta);
        if (index !== -1) {
            this.cuentas.splice(index, 1);
            return true;
        }
        console.log("Cuenta no encontrada.");
        return false;
    }

    obtenerCuenta(numeroCuenta) {
        return this.cuentas.find(c => c.numeroCuenta === numeroCuenta) || null;
    }

    autenticar(usuario, contraseña) {
        if (this.bloqueado) {
            console.log("Cuenta bloqueada. Contacte al banco para desbloquear.");
            return false;
        }

        if (this.usuario === usuario && this.contraseña === contraseña) {
            this.intentosFallidos = 0;
            return true;
        } else {
            this.intentosFallidos++;
            if (this.intentosFallidos >= 3) {
                this.bloquearCuenta();
                console.log("Demasiados intentos fallidos. Cuenta bloqueada.");
            } else {
                console.log(`Intento fallido. Intentos restantes: ${3 - this.intentosFallidos}`);
            }
            return false;
        }
    }

    bloquearCuenta() {
        this.bloqueado = true;
    }

    cambiarContraseña(nuevaContraseña, viejaContraseña) {
        if (this.contraseña === viejaContraseña) {
            this.contraseña = nuevaContraseña;
            return true;
        }
        return false;
    }

    resetearIntentosFallidos() {
        this.intentosFallidos = 0;
        this.bloqueado = false;
    }

    editarPerfil(nombre, celular) {
        this.nombre = nombre;
        this.celular = celular;
    }

    
}