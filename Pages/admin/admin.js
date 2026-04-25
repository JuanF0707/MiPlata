const cuerpoTabla = document.getElementById('cuerpo-tabla')
const formEdicion = document.getElementById('form-edicion')

function cargarUsuarios (){
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    cuerpoTabla.innerHTML = ''

    if(usuarios.length === 0){
        cuerpoTabla.innerHTML = '<tr><td colspan ="5">No hay usuarios registrados</td></tr>'
        return
    }

    usuarios.forEach(u => {
        const fila = document.createElement('tr')
        fila.innerHTML = `
            <td>${u.identificacion}</td>
            <td>${u.nombre}</td>
            <td>${u.celular}</td>
            <td>${u.usuario}</td>
            <td>
                <button onclick = "editarUsuario('${u.usuario}')">Editar</button>
                <button onclick = "eliminarUsuario('${u.usuario}')">Eliminar</button>
            </td>
        `
        cuerpoTabla.appendChild(fila)
        
    });
}

cargarUsuarios()

function editarUsuario(usuario){
    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const u = usuarios.find(u=> u.usuario === usuario)
    if (!u) return

    document.getElementById('editar-usuario').value = u.usuario
    document.getElementById('editar-nombre').value = u.nombre
    document.getElementById('editar-celular').value = u.celular
    formEdicion.classList.remove ('oculto')
}

function guardarEdicion(){
    const usuario = document.getElementById('editar-usuario').value
    const nombre = document.getElementById('editar-nombre').value.trim()
    const celular = document.getElementById('editar-celular').value.trim()

    if(!nombre || !celular) {alert('Completa todos los campos.'); return}

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    const index = usuarios.findIndex(u=> u.usuario === usuario)
    if(index !== -1){
        usuarios[index].nombre = nombre
        usuarios[index].celular = celular
        localStorage.setItem('usuarios', JSON.stringify(usuarios))
        alert('Usuario actualizado')
        cancelarEdicion()
        cargarUsuarios()
    }
}

function cancelarEdicion (){
    formEdicion.classList.add('oculto')
    document.getElementById('editar-nombre').value = ''
    document.getElementById('editar-celular').value = ''
}

function eliminarUsuario (usuario){
    if(!confirm (`¿Seguro que deseas eliminar al usuario "${usuario}"?`))return

    let usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    usuarios = usuarios.filter(u => u.usuario !== usuario)
    localStorage.setItem('usuarios', JSON.stringify(usuarios))

    let cuentas = JSON.parse(localStorage.getItem('cuentas') || '[]')
    cuentas = cuentas.filter(c => c.usuario !== usuario)
    localStorage.setItem('cuentas', JSON.stringify(cuentas))

    alert('Usuario eliminado.')
    cargarUsuarios()
}

function mostrarFormAgregar() {
    document.getElementById('form-agregar').classList.remove('oculto')
    document.getElementById('form-edicion').classList.add('oculto')
}

function cancelarAgregar() {
    document.getElementById('form-agregar').classList.add('oculto')
    document.getElementById('error-agregar').textContent = ''
    ;['agregar-identificacion','agregar-nombre','agregar-celular','agregar-usuario','agregar-contrasena','agregar-confirmar']
        .forEach(id => { document.getElementById(id).value = '' })
}

function guardarNuevoUsuario() {
    const errorEl = document.getElementById('error-agregar')
    errorEl.textContent = ''

    const identificacion = document.getElementById('agregar-identificacion').value.trim()
    const nombre = document.getElementById('agregar-nombre').value.trim()
    const celular = document.getElementById('agregar-celular').value.trim()
    const usuario = document.getElementById('agregar-usuario').value.trim()
    const contrasena = document.getElementById('agregar-contrasena').value.trim()
    const confirmar = document.getElementById('agregar-confirmar').value.trim()

    if (!identificacion || !nombre || !celular || !usuario || !contrasena) {
        errorEl.textContent = 'Completa todos los campos.'
        return
    }
    if (contrasena !== confirmar) {
        errorEl.textContent = 'Las contraseñas no coinciden.'
        return
    }

    const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
    if (usuarios.find(u => u.usuario === usuario)) {
        errorEl.textContent = 'Ese nombre de usuario ya existe.'
        return
    }

    usuarios.push({ identificacion, nombre, celular, usuario, contraseña: contrasena })
    localStorage.setItem('usuarios', JSON.stringify(usuarios))

    const cuentas = JSON.parse(localStorage.getItem('cuentas') || '[]')
    cuentas.push({ usuario, tipo: 'ahorros', numeroCuenta: Math.floor(Math.random() * 9000000000 + 1000000000).toString(), saldo: 0, movimientos: [] })
    cuentas.push({ usuario, tipo: 'corriente', numeroCuenta: Math.floor(Math.random() * 9000000000 + 1000000000).toString(), saldo: 0, movimientos: [] })
    cuentas.push({ usuario, tipo: 'credito', numeroCuenta: Math.floor(Math.random() * 9000000000 + 1000000000).toString(), saldo: 0, deuda: 0, cupo: 5000000, numeroCuotas: 0, movimientos: [] })
    localStorage.setItem('cuentas', JSON.stringify(cuentas))

    alert(`Usuario "${usuario}" creado correctamente.`)
    cancelarAgregar()
    cargarUsuarios()
}

window.editarUsuario = editarUsuario
window.guardarEdicion = guardarEdicion
window.cancelarEdicion = cancelarEdicion
window.eliminarUsuario = eliminarUsuario
window.mostrarFormAgregar = mostrarFormAgregar
window.cancelarAgregar = cancelarAgregar
window.guardarNuevoUsuario = guardarNuevoUsuario