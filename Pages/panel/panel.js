import CuentaAhorros from '../../Models/cuentaAhorros.js'
import CuentaCorriente from '../../Models/cuentaCorriente.js'
import TarjetaCredito from '../../Models/tarjetaCredito.js'
import EstadoCuenta from '../../Models/estadoCuenta.js'

const usuarioActual = sessionStorage.getItem('usuarioActual')
if (!usuarioActual) window.location.href = '../login/login.html'

const tiposEntrada = ['consignación', 'interés aplicado', 'transferencia entrante', 'pago tarjeta de crédito']
function esEntrada(tipo) {
    return tiposEntrada.some(t => tipo.toLowerCase().includes(t))
}

const todasLasCuentas = JSON.parse(localStorage.getItem('cuentas') || '[]')
const cuentasUsuario = todasLasCuentas.filter(c => c.usuario === usuarioActual)

let saldoVisible = true

function reconstruirCuenta(data) {
    if (data.tipo === 'ahorros')
        return new CuentaAhorros(new Date(), data.numeroCuenta, data.saldo, EstadoCuenta.ACTIVA, data.movimientos, 0.015)
    if (data.tipo === 'corriente')
        return new CuentaCorriente(new Date(), data.numeroCuenta, data.saldo, EstadoCuenta.ACTIVA, data.movimientos)
    if (data.tipo === 'credito')
        return new TarjetaCredito(new Date(), data.numeroCuenta, data.saldo, EstadoCuenta.ACTIVA, data.movimientos, data.cupo, data.deuda, data.numeroCuotas)
}

let cuenta = reconstruirCuenta(cuentasUsuario.find(c => c.tipo === 'ahorros'))

document.getElementById('nombre-usuario').textContent = `Hola, ${usuarioActual}`
actualizarSaldo()
actualizarBotonesSidebar()
mostrarNumeroCuenta()
inicializarTarjetas()
cargarActividadReciente()

function inicializarTarjetas() {
    ;['ahorros', 'corriente', 'credito'].forEach(tipo => {
        const data = cuentasUsuario.find(c => c.tipo === tipo)
        if (data) document.getElementById(`num-${tipo}`).textContent = `N° ${data.numeroCuenta}`
    })
    actualizarTarjetaActiva('ahorros')
}

function actualizarTarjetaActiva(tipo) {
    document.querySelectorAll('.mini-card').forEach(c => c.classList.remove('activa'))
    document.getElementById(`card-${tipo}`).classList.add('activa')
}

function cambiarCuenta(tipo) {
    const cuentasActualizadas = JSON.parse(localStorage.getItem('cuentas') || '[]')
    const data = cuentasActualizadas.find(c => c.usuario === usuarioActual && c.tipo === tipo)
    cuenta = reconstruirCuenta(data)
    actualizarSaldo()
    actualizarBotonesSidebar()
    mostrarNumeroCuenta()
    actualizarTarjetaActiva(tipo)
    mostrarSeccion('saldo')
    cargarActividadReciente()
}

function mostrarNumeroCuenta() {
    document.getElementById('numero-cuenta-card').textContent = `N° ${cuenta.numeroCuenta}`
}

function actualizarBotonesSidebar() {
    const esCredito = cuenta instanceof TarjetaCredito
    document.getElementById('btn-consignar').style.display = esCredito ? 'none' : 'flex'
    document.getElementById('btn-retirar').style.display = esCredito ? 'none' : 'flex'
    document.getElementById('btn-comprar').style.display = esCredito ? 'flex' : 'none'
    document.getElementById('btn-pagar').style.display = esCredito ? 'flex' : 'none'
    document.getElementById('btn-avance').style.display = esCredito ? 'flex' : 'none'
    document.getElementById('btn-transferir').style.display = esCredito ? 'none' : 'flex'

    // Acciones rápidas del inicio — cambian según el producto
    document.getElementById('accion-icono-1').textContent = esCredito ? '🛍️' : '💰'
    document.getElementById('accion-label-1').textContent = esCredito ? 'Comprar' : 'Consignar'
    document.getElementById('accion-icono-2').textContent = esCredito ? '💳' : '💸'
    document.getElementById('accion-label-2').textContent = esCredito ? 'Pagar TC' : 'Retirar'
    document.getElementById('accion-icono-3').textContent = esCredito ? '💵' : '↗️'
    document.getElementById('accion-label-3').textContent = esCredito ? 'Avance TC' : 'Transferir'
}

function accionRapida1() {
    mostrarSeccion(cuenta instanceof TarjetaCredito ? 'comprar' : 'consignar')
}

function accionRapida2() {
    mostrarSeccion(cuenta instanceof TarjetaCredito ? 'pagar' : 'retirar')
}

function accionRapida3() {
    mostrarSeccion(cuenta instanceof TarjetaCredito ? 'avance' : 'transferir')
}

function actualizarSaldo() {
    const elSaldo = document.getElementById('valor-saldo')
    const elInfo = document.getElementById('info-credito')
    const elRef1 = document.getElementById('saldo-ref-consignar')
    const elRef2 = document.getElementById('saldo-ref-retirar')
    const elRef3 = document.getElementById('saldo-ref-transferir')

    if (cuenta instanceof TarjetaCredito) {
        const disponible = cuenta.cupo - cuenta.deuda
        elSaldo.textContent = saldoVisible ? `$${disponible.toLocaleString()}` : '••••••'
        elInfo.textContent = `Cupo: $${cuenta.cupo.toLocaleString()} | Deuda: $${cuenta.deuda.toLocaleString()}`
        if (elRef3) elRef3.textContent = `$${disponible.toLocaleString()}`
        const elRef4 = document.getElementById('saldo-ref-comprar')
        if (elRef4) elRef4.textContent = `$${disponible.toLocaleString()}`
        const elRef5 = document.getElementById('saldo-ref-avance')
        if (elRef5) elRef5.textContent = `$${disponible.toLocaleString()}`
    } else {
        elSaldo.textContent = saldoVisible ? `$${cuenta.saldo.toLocaleString()}` : '••••••'
        elInfo.textContent = ''
        if (elRef1) elRef1.textContent = `$${cuenta.saldo.toLocaleString()}`
        if (elRef2) elRef2.textContent = `$${cuenta.saldo.toLocaleString()}`
        if (elRef3) elRef3.textContent = `$${cuenta.saldo.toLocaleString()}`
    }
}

function toggleSaldo() {
    saldoVisible = !saldoVisible
    const btn = document.getElementById('btn-toggle-saldo')
    btn.textContent = saldoVisible ? '👁' : '🙈'
    actualizarSaldo()
}


function guardarCuenta() {
    const cuentas = JSON.parse(localStorage.getItem('cuentas') || '[]')
    const index = cuentas.findIndex(c => c.numeroCuenta === cuenta.numeroCuenta)
    if (index !== -1) {
        cuentas[index].saldo = cuenta.saldo
        cuentas[index].movimientos = cuenta.movimientos
        if (cuenta instanceof TarjetaCredito) cuentas[index].deuda = cuenta.deuda
        localStorage.setItem('cuentas', JSON.stringify(cuentas))
    }
}


function mostrarSeccion(id) {
    document.querySelectorAll('.seccion').forEach(s => s.classList.add('oculto'))
    document.querySelectorAll('.sidebar-btn').forEach(b => b.classList.remove('activo'))
    document.getElementById(id).classList.remove('oculto')
    const btnActivo = document.getElementById(`btn-${id}`)
    if (btnActivo) btnActivo.classList.add('activo')
    if (id === 'movimientos') mostrarMovimientos()
    if (id === 'saldo') { actualizarSaldo(); cargarActividadReciente() }
    if (id === 'perfil') cargarPerfil()
    if (id === 'comprar') document.getElementById('resultado-compra').classList.add('oculto')
    if (id === 'avance') document.getElementById('resultado-avance').classList.add('oculto')
    if (id === 'pagar') document.getElementById('deuda-actual').textContent =
        `Deuda actual: $${cuenta instanceof TarjetaCredito ? cuenta.deuda.toLocaleString() : 0}`
}

function mostrarError(id, msg) {
    const el = document.getElementById(id)
    if (el) el.textContent = msg
}

function limpiarError(id) { mostrarError(id, '') }

function montoRapido(inputId, valor) {
    const input = document.getElementById(inputId)
    input.value = (parseFloat(input.value) || 0) + valor
}


function consignar() {
    limpiarError('error-consignar')
    const monto = parseFloat(document.getElementById('monto-consignar').value)
    if (isNaN(monto) || monto <= 0) { mostrarError('error-consignar', 'Ingresa un monto válido mayor a cero.'); return }

    cuenta.consignar(monto)
    guardarCuenta()
    actualizarSaldo()
    document.getElementById('monto-consignar').value = ''
    alert(`Consignación exitosa. Nuevo saldo: $${cuenta.saldo.toLocaleString()}`)
}

function retirar() {
    limpiarError('error-retirar')
    const monto = parseFloat(document.getElementById('monto-retirar').value)
    if (isNaN(monto) || monto <= 0) { mostrarError('error-retirar', 'Ingresa un monto válido mayor a cero.'); return }

    const saldoAntes = cuenta.saldo
    cuenta.retirar(monto)
    if (cuenta.saldo === saldoAntes) { mostrarError('error-retirar', 'Saldo insuficiente para realizar el retiro.'); return }

    guardarCuenta()
    actualizarSaldo()
    document.getElementById('monto-retirar').value = ''
    alert(`Retiro exitoso. Nuevo saldo: $${cuenta.saldo.toLocaleString()}`)
}

function comprar() {
    limpiarError('error-comprar')
    document.getElementById('resultado-compra').classList.add('oculto')
    if (!(cuenta instanceof TarjetaCredito)) { mostrarError('error-comprar', 'Solo aplica para Tarjeta de Crédito.'); return }

    const monto = parseFloat(document.getElementById('monto-comprar').value)
    const cuotas = parseInt(document.getElementById('cuotas-comprar').value)
    if (isNaN(monto) || monto <= 0 || isNaN(cuotas) || cuotas <= 0) {
        mostrarError('error-comprar', 'Ingresa un monto y número de cuotas válidos.'); return
    }

    const deudaAntes = cuenta.deuda
    const cuotaMensual = cuenta.comprar(monto, cuotas)
    if (cuenta.deuda === deudaAntes) { mostrarError('error-comprar', 'Cupo insuficiente.'); return }

    const tasa = cuotas <= 2 ? '0% (sin interés)' : cuotas <= 6 ? '1.9% mensual' : '2.3% mensual'

    guardarCuenta()
    actualizarSaldo()
    document.getElementById('monto-comprar').value = ''
    document.getElementById('cuotas-comprar').value = ''

    document.getElementById('cuota-mensual-valor').textContent = `$${cuotaMensual.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    document.getElementById('tasa-aplicada-valor').textContent = tasa
    document.getElementById('resultado-compra').classList.remove('oculto')
}

function pagar() {
    limpiarError('error-pagar')
    if (!(cuenta instanceof TarjetaCredito)) return

    const monto = parseFloat(document.getElementById('monto-pagar').value)
    if (isNaN(monto) || monto <= 0) { mostrarError('error-pagar', 'Ingresa un monto válido.'); return }

    const deudaAntes = cuenta.deuda
    cuenta.pagar(monto)
    if (cuenta.deuda === deudaAntes) { mostrarError('error-pagar', 'El valor supera la deuda actual.'); return }

    guardarCuenta()
    actualizarSaldo()
    document.getElementById('monto-pagar').value = ''
    document.getElementById('deuda-actual').textContent = `Deuda actual: $${cuenta.deuda.toLocaleString()}`
    alert(`Pago exitoso. Deuda restante: $${cuenta.deuda.toLocaleString()}`)
}

function avance() {
    limpiarError('error-avance')
    document.getElementById('resultado-avance').classList.add('oculto')
    if (!(cuenta instanceof TarjetaCredito)) return

    const monto = parseFloat(document.getElementById('monto-avance').value)
    const cuotas = parseInt(document.getElementById('cuotas-avance').value)
    if (isNaN(monto) || monto <= 0 || isNaN(cuotas) || cuotas <= 0) {
        mostrarError('error-avance', 'Ingresa un monto y número de cuotas válidos.'); return
    }

    const deudaAntes = cuenta.deuda
    const cuotaMensual = cuenta.retirar(monto, cuotas)
    if (cuenta.deuda === deudaAntes) { mostrarError('error-avance', 'Cupo insuficiente para el avance.'); return }

    guardarCuenta()
    actualizarSaldo()
    document.getElementById('monto-avance').value = ''
    document.getElementById('cuotas-avance').value = ''
    document.getElementById('cuota-avance-valor').textContent = `$${cuotaMensual.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    document.getElementById('resultado-avance').classList.remove('oculto')
}

function transferir() {
    limpiarError('error-transferir')
    const numeroCuentaDestino = document.getElementById('cuenta-destino').value.trim()
    const monto = parseFloat(document.getElementById('monto-transferir').value)

    if (!numeroCuentaDestino || isNaN(monto) || monto <= 0) {
        mostrarError('error-transferir', 'Ingresa una cuenta destino y un monto válido.'); return
    }

    const cuentas = JSON.parse(localStorage.getItem('cuentas') || '[]')
    const cuentaDestinoData = cuentas.find(c => c.numeroCuenta === numeroCuentaDestino)
    if (!cuentaDestinoData) { mostrarError('error-transferir', 'Cuenta destino no encontrada.'); return }

    const cuentaDestino = reconstruirCuenta(cuentaDestinoData)
    const saldoAntes = cuenta instanceof TarjetaCredito ? cuenta.deuda : cuenta.saldo
    cuenta.transferir(monto, cuentaDestino)
    const saldoDespues = cuenta instanceof TarjetaCredito ? cuenta.deuda : cuenta.saldo
    if (saldoAntes === saldoDespues) { mostrarError('error-transferir', 'No se pudo realizar la transferencia.'); return }

    const indexOrigen = cuentas.findIndex(c => c.numeroCuenta === cuenta.numeroCuenta)
    const indexDestino = cuentas.findIndex(c => c.numeroCuenta === numeroCuentaDestino)
    cuentas[indexOrigen].saldo = cuenta.saldo
    cuentas[indexOrigen].movimientos = cuenta.movimientos
    if (cuenta instanceof TarjetaCredito) cuentas[indexOrigen].deuda = cuenta.deuda
    cuentas[indexDestino].saldo = cuentaDestino.saldo
    cuentas[indexDestino].movimientos = cuentaDestino.movimientos
    localStorage.setItem('cuentas', JSON.stringify(cuentas))

    actualizarSaldo()
    document.getElementById('cuenta-destino').value = ''
    document.getElementById('monto-transferir').value = ''
    alert('Transferencia exitosa.')
}

function mostrarMovimientos(filtro = 'todos') {
    const lista = document.getElementById('lista-movimientos')
    lista.innerHTML = ''
    let movimientos = [...cuenta.movimientos].reverse()

    if (filtro === 'entrada') movimientos = movimientos.filter(m => esEntrada(m.tipo))
    if (filtro === 'salida') movimientos = movimientos.filter(m => !esEntrada(m.tipo))

    if (movimientos.length === 0) {
        lista.innerHTML = '<li class="vacio">📭 Aún no tienes movimientos registrados.</li>'
        return
    }

    movimientos.forEach(m => {
        const li = document.createElement('li')
        const entrada = esEntrada(m.tipo)
        li.className = `movimiento ${entrada ? 'entrada' : 'salida'}`
        li.innerHTML = `
            <span class="mov-tipo">${m.tipo}</span>
            <span class="mov-fecha">${new Date(m.fecha).toLocaleString()}</span>
            <span class="mov-valor ${entrada ? 'positivo' : 'negativo'}">${entrada ? '+' : '-'}$${m.valor.toLocaleString()}</span>
        `
        lista.appendChild(li)
    })
}

function filtrarMovimientos(filtro, btn) {
    document.querySelectorAll('.filtro-btn').forEach(b => b.classList.remove('activo'))
    btn.classList.add('activo')
    mostrarMovimientos(filtro)
}

function cargarActividadReciente() {
    const lista = document.getElementById('lista-reciente')
    lista.innerHTML = ''
    const recientes = [...cuenta.movimientos].reverse().slice(0, 5)

    if (recientes.length === 0) {
        lista.innerHTML = '<li class="vacio">📭 No hay movimientos recientes.</li>'
        return
    }

    recientes.forEach(m => {
        const li = document.createElement('li')
        const entrada = esEntrada(m.tipo)
        li.className = `movimiento ${entrada ? 'entrada' : 'salida'}`
        li.innerHTML = `
            <span class="mov-tipo">${m.tipo}</span>
            <span class="mov-fecha">${new Date(m.fecha).toLocaleDateString()}</span>
            <span class="mov-valor ${entrada ? 'positivo' : 'negativo'}">${entrada ? '+' : '-'}$${m.valor.toLocaleString()}</span>
        `
        lista.appendChild(li)
    })
}


function cargarPerfil() {
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const usuario = usuarios.find(u => u.usuario === usuarioActual)
    if (!usuario) return
    document.getElementById('perfil-identificacion').value = usuario.identificacion || ''
    document.getElementById('perfil-nombre').value = usuario.nombre || ''
    document.getElementById('perfil-celular').value = usuario.celular || ''
}

function guardarPerfil() {
    const identificacion = document.getElementById('perfil-identificacion').value.trim()
    const nombre = document.getElementById('perfil-nombre').value.trim()
    const celular = document.getElementById('perfil-celular').value.trim()
    if (!identificacion || !nombre || !celular) { alert('Completa todos los campos.'); return }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const index = usuarios.findIndex(u => u.usuario === usuarioActual)
    if (index !== -1) {
        usuarios[index].identificacion = identificacion
        usuarios[index].nombre = nombre
        usuarios[index].celular = celular
        localStorage.setItem('usuarios', JSON.stringify(usuarios))
        alert('Perfil actualizado correctamente.')
    }
}

function cambiarContrasena() {
    limpiarError('error-password')
    const claveActual = document.getElementById('clave-actual').value.trim()
    const claveNueva = document.getElementById('clave-nueva').value.trim()
    const claveConfirmar = document.getElementById('clave-confirmar').value.trim()

    if (claveNueva !== claveConfirmar) { mostrarError('error-password', 'Las contraseñas nuevas no coinciden.'); return }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const index = usuarios.findIndex(u => u.usuario === usuarioActual)
    if (index === -1) return

    if (usuarios[index].contraseña !== claveActual) { mostrarError('error-password', 'La contraseña actual es incorrecta.'); return }

    usuarios[index].contraseña = claveNueva
    localStorage.setItem('usuarios', JSON.stringify(usuarios))
    alert('Contraseña cambiada correctamente.')
    document.getElementById('clave-actual').value = ''
    document.getElementById('clave-nueva').value = ''
    document.getElementById('clave-confirmar').value = ''
}

function cerrarSesion() {
    sessionStorage.removeItem('usuarioActual')
    window.location.href = '../login/login.html'
}

window.cerrarSesion = cerrarSesion
window.mostrarSeccion = mostrarSeccion
window.cambiarCuenta = cambiarCuenta
window.toggleSaldo = toggleSaldo
window.montoRapido = montoRapido
window.consignar = consignar
window.retirar = retirar
window.comprar = comprar
window.pagar = pagar
window.transferir = transferir
window.filtrarMovimientos = filtrarMovimientos
window.guardarPerfil = guardarPerfil
window.cambiarContrasena = cambiarContrasena
window.cargarPerfil = cargarPerfil
window.accionRapida1 = accionRapida1
window.accionRapida2 = accionRapida2
window.accionRapida3 = accionRapida3
window.avance = avance
