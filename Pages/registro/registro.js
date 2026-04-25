import FlujoRegistro from '../../services/flujoRegistro.js'

const banco = new FlujoRegistro()

const formRegistro = document.getElementById('form-registro')
const inputIdentificacion = document.getElementById('identificacion')
const inputNombre = document.getElementById('nombre')
const inputCelular = document.getElementById('celular')
const inputUsuario = document.getElementById('usuario')
const inputContraseña = document.getElementById('contraseña')
const inputConfirmar = document.getElementById('confirmar')

// Cargar usuarios existentes desde localStorage al banco
const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || '[]')
usuariosGuardados.forEach(u => banco.registrar(u.identificacion, u.nombre, u.celular, u.usuario, u.contraseña))

function mostrarError(id, mensaje) {
    const el = document.getElementById(id)
    if (el) el.textContent = mensaje
}

function limpiarErrores() {
    ['error-identificacion', 'error-nombre', 'error-celular',
     'error-usuario', 'error-contrasena', 'error-confirmar'].forEach(id => mostrarError(id, ''))
}

// Mostrar/ocultar contraseña
function togglePassword(id, btn) {
    const input = document.getElementById(id)
    if (input.type === 'password') {
        input.type = 'text'
        btn.textContent = '🙈'
    } else {
        input.type = 'password'
        btn.textContent = '👁'
    }
}

formRegistro.addEventListener('submit', function(event) {
    event.preventDefault()
    limpiarErrores()

    const identificacion = inputIdentificacion.value.trim()
    const nombre = inputNombre.value.trim()
    const celular = inputCelular.value.trim()
    const usuario = inputUsuario.value.trim()
    const contraseña = inputContraseña.value.trim()
    const confirmar = inputConfirmar.value.trim()

    let hayError = false

    if (!identificacion) { mostrarError('error-identificacion', 'La identificación es obligatoria.'); hayError = true }
    if (!nombre) { mostrarError('error-nombre', 'El nombre es obligatorio.'); hayError = true }
    if (!celular) { mostrarError('error-celular', 'El celular es obligatorio.'); hayError = true }
    if (!usuario) { mostrarError('error-usuario', 'El usuario es obligatorio.'); hayError = true }
    if (!contraseña) { mostrarError('error-contrasena', 'La contraseña es obligatoria.'); hayError = true }

    if (contraseña !== confirmar) {
        mostrarError('error-confirmar', 'Las contraseñas no coinciden.')
        hayError = true
    }

    if (hayError) return

    const nuevo = banco.registrar(identificacion, nombre, celular, usuario, contraseña)

    if (!nuevo) {
        mostrarError('error-usuario', 'Ese nombre de usuario ya está en uso.')
        return
    }

    // Guardar lista actualizada de usuarios en localStorage
    const todos = banco.listarClientes().map(c => ({
        identificacion: c.identificacion,
        nombre: c.nombre,
        celular: c.celular,
        usuario: c.usuario,
        contraseña: c.contraseña
    }))
    localStorage.setItem('usuarios', JSON.stringify(todos))

    // Crear los 3 productos bancarios automáticamente al registrarse
    const cuentas = JSON.parse(localStorage.getItem('cuentas') || '[]')

    cuentas.push({
        usuario, tipo: 'ahorros',
        numeroCuenta: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
        saldo: 0, movimientos: []
    })
    cuentas.push({
        usuario, tipo: 'corriente',
        numeroCuenta: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
        saldo: 0, movimientos: []
    })
    cuentas.push({
        usuario, tipo: 'credito',
        numeroCuenta: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
        saldo: 0, deuda: 0, cupo: 5000000, numeroCuotas: 0, movimientos: []
    })

    localStorage.setItem('cuentas', JSON.stringify(cuentas))

    alert('Registro exitoso. Ahora puedes iniciar sesión.')
    window.location.href = '../login/login.html'
})

window.togglePassword = togglePassword
