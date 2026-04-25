function mostrarMensaje(texto, tipo){
    const mensaje = document.createElement('div');
    mensaje.textContent = texto
    mensaje.className = `mensaje ${tipo}`
    document.body.appendChild(mensaje)

    setTimeout(()=>{
        mensaje.remove()
    }, 3000)
}