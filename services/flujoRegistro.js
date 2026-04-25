import Cliente from '../Models/cliente.js';

class FlujoRegistro {
    constructor() {
        this.clientes = [];
        this.nextId = 1;
    }

    // CREATE — Registrar nuevo cliente
    registrar(identificacion, nombre, celular, usuario, contraseña) {
        if (this.buscarPorUsuario(usuario)) {
            console.log("El nombre de usuario ya existe.");
            return null;
        }
        const cliente = new Cliente(this.nextId++, identificacion, nombre, celular, usuario, contraseña);
        this.clientes.push(cliente);
        return cliente;
    }

    // READ — Buscar por usuario (para login)
    buscarPorUsuario(usuario) {
        return this.clientes.find(c => c.usuario === usuario) || null;
    }

    // READ — Buscar por id
    buscarPorId(id) {
        return this.clientes.find(c => c.id === id) || null;
    }

    // READ — Listar todos los clientes
    listarClientes() {
        return [...this.clientes];
    }

    // UPDATE — Editar datos de perfil
    editarCliente(id, nombre, celular) {
        const cliente = this.buscarPorId(id);
        if (!cliente) {
            console.log("Cliente no encontrado.");
            return false;
        }
        cliente.editarPerfil(nombre, celular);
        return true;
    }

    // DELETE — Eliminar cliente del sistema
    eliminarCliente(id) {
        const index = this.clientes.findIndex(c => c.id === id);
        if (index !== -1) {
            this.clientes.splice(index, 1);
            return true;
        }
        console.log("Cliente no encontrado.");
        return false;
    }

    // LOGIN — Autenticar y devolver cliente si es exitoso
    iniciarSesion(usuario, contraseña) {
        const cliente = this.buscarPorUsuario(usuario);
        if (!cliente) {
            console.log("Usuario no encontrado.");
            return null;
        }
        const autenticado = cliente.autenticar(usuario, contraseña);
        return autenticado ? cliente : null;
    }
}

export default FlujoRegistro;
