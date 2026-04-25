import FlujoRegistro from '../../services/flujoRegistro.js'

const banco = new FlujoRegistro()

const formLogin = document.getElementById('form-login')
const inputUsuario = document.getElementById('usuario')
const inputContraseña = document.getElementById('contraseña')
const contadorIntentos = document.getElementById('contador-intentos')

const usuariosGuardados = JSON.parse(localStorage.getItem('usuarios') || '[]')
usuariosGuardados.forEach(u => banco.registrar(u.identificacion, u.nombre, u.celular, u.usuario, u.contraseña))

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

function mostrarError(id, mensaje) {
    const el = document.getElementById(id)
    if (el) el.textContent = mensaje
}

function limpiarErrores() {
    mostrarError('error-usuario', '')
    mostrarError('error-contrasena', '')
    contadorIntentos.textContent = ''
    contadorIntentos.className = 'contador'
}

formLogin.addEventListener('submit', function(event) {
    event.preventDefault()
    limpiarErrores()

    const usuario = inputUsuario.value.trim()
    const contraseña = inputContraseña.value.trim()

    const clienteEncontrado = banco.buscarPorUsuario(usuario)

    if (!clienteEncontrado) {
        mostrarError('error-usuario', 'Usuario no encontrado.')
        return
    }

    if (clienteEncontrado.bloqueado) {
        contadorIntentos.textContent = '🔒 Cuenta bloqueada. Contacta al banco.'
        contadorIntentos.classList.add('bloqueado')
        return
    }

    const autenticado = banco.iniciarSesion(usuario, contraseña)

    if (autenticado) {
        sessionStorage.setItem('usuarioActual', usuario)
        window.location.href = '../panel/panel.html'
    } else {
        const restantes = 3 - clienteEncontrado.intentosFallidos
        if (clienteEncontrado.bloqueado) {
            contadorIntentos.textContent = '🔒 Cuenta bloqueada. Contacta al banco.'
            contadorIntentos.classList.add('bloqueado')
        } else {
            contadorIntentos.textContent = `⚠️ Credenciales incorrectas. Intentos restantes: ${restantes}`
            contadorIntentos.classList.add('advertencia')
            mostrarError('error-contrasena', 'Contraseña incorrecta.')
        }
    }
})

window.togglePassword = togglePassword
