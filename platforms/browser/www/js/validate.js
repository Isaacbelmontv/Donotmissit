function validar() {
  if ($('#title').val().length == 0) {
    alert('Ingrese datos');
    return false;
  }
  else {
    alert('Nombre agregado');
  }
}
function validardos() {
  if ($('#genero').val().length == 0) {
    alert('Ingrese datos');
    return false;
  }
  else {
    alert('Genero agregado');
  }
}
function validartres() {
  if ($('#fecha').val().length == 0) {
    alert('Ingrese datos');
    return false;
  }
  else {
    alert('Fecha agregada');
  }
}
