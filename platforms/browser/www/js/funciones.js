var indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
var dataBase = null;

function startDB() {

    dataBase = indexedDB.open("object", 1);
    dataBase.onupgradeneeded = function (e) {

        var active = dataBase.result;
        var object = active.createObjectStore("Series", {keyPath: 'id', autoIncrement: true});
        object.createIndex('by_name', 'name', {unique: false});
        object.createIndex('by_genero', 'genero', {unique: false});
        object.createIndex('by_fecha', 'fecha', {unique: false});
        object.createIndex('by_dni', 'dni', {unique: true});

    };

    dataBase.onsuccess = function (e) {
        //alert('App funcionando correctamente'+'\n'+'Ejemplo de como ingresar datos'+'\n'+'Numero:1'+'\n'+'Nombre: Izombie'+'\n'+'Genero: Terror'+'\n'+'Fecha: 13-04-2017'+'\n'+'Nota. si falta algun campo surgira un error');
         loadAll();
    };

    dataBase.onerror = function (e) {
        alert('Error cargando la base de datos');
    };

}

function add() {
    var active = dataBase.result;
    var data = active.transaction(["Series"], "readwrite");
    var object = data.objectStore("Series");

    var request = object.put({
        dni: document.querySelector("#dni").value,
        name: document.querySelector("#name").value,
        genero: document.querySelector("#genero").value,
        fecha: document.querySelector("#fecha").value
    });

    request.onerror = function (e) {
        alert(request.error.name + '\n\n' + request.error.message);
    };

    data.oncomplete = function (e) {

        document.querySelector('#dni').value = '';
        document.querySelector('#name').value = '';
        document.querySelector('#genero').value = '';
        document.querySelector('#fecha').value = '';
        alert('Serie agregada correctamente');
        loadAll();
    };
}
function load(id) {
    var active = dataBase.result;
    var data = active.transaction(["Series"], "readonly");
    var object = data.objectStore("Series");

    var request = object.get(parseInt(id));

    request.onsuccess = function () {
        var result = request.result;

        if (result !== undefined) {
            alert("ID: " + result.id + "\n\
                   DNI " + result.dni + "\n\
                   Name: " + result.name + "\n\
                   Genero: " + result.genero + "\n\
                   Fecha: " + result.fecha);
        }
    };
}
function loadByDni(dni) {
    var active = dataBase.result;
    var data = active.transaction(["Series"], "readonly");
    var object = data.objectStore("Series");
    var index = object.index("by_dni");
    var request = index.get(String(dni));

    request.onsuccess = function () {
        var result = request.result;

        if (result !== undefined) {
            alert("ID: " + result.id + "\n\
                   DNI " + result.dni + "\n\
                   Name: " + result.name + "\n\
                   Genero: " + result.genero + "\n\
                   Fecha: " + result.fecha);
        }
    };
}
/*load*/
function loadAll() {
    var active = dataBase.result;
    var data = active.transaction(["Series"], "readonly");
    var object = data.objectStore("Series");

    var elements = [];

    object.openCursor().onsuccess = function (e) {

        var result = e.target.result;

        if (result === null) {
            return;
        }

        elements.push(result.value);
        result.continue();

    };

    data.oncomplete = function () {

        var outerHTML = '';

        for (var key in elements) {

            outerHTML += '\n\
            <tr>\n\
                <td>' + elements[key].dni + '</td>\n\
                <td>' + elements[key].name + '</td>\n\
                <td>' + elements[key].genero + '</td>\n\
                <td>' + elements[key].fecha + '</td>\n\
            </tr>';

        }
        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
    };
}
/*otro*/
function loadAllByName() {
    var active = dataBase.result;
    var data = active.transaction(["Series"], "readonly");
    var object = data.objectStore("Series");
    var index = object.index("by_name");

    var elements = [];

    index.openCursor().onsuccess = function (e) {

        var result = e.target.result;

        if (result === null) {
            return;
        }

        elements.push(result.value);
        result.continue();

    };

    data.oncomplete = function () {

        var outerHTML = '';

        for (var key in elements) {

            outerHTML += '\n\
            <tr>\n\
                <td>' + elements[key].dni + '</td>\n\
                <td>' + elements[key].name + '</td>\n\
                <td>' + elements[key].genero + '</td>\n\
                <td>' + elements[key].fecha + '</td>\n\
            </tr>';

        }
        elements = [];
        document.querySelector("#elementsList").innerHTML = outerHTML;
    };
}
/*Delete*/
function deleteDatabase(){
//indexedDB.deleteDatabase("object")metodo alternativo
indexedDB.webkitGetDatabaseNames().onsuccess = function(event) {
  Array.prototype.forEach.call(event.target.result, indexedDB.deleteDatabase.bind(indexedDB));
}
}
/*search*/
function search(){
  var keyword = "foo";
  var transaction = db.transaction("Series", "readwrite");
  var objectStore = transaction.objectStore("Series");
  var request = objectStore.openCursor();
  request.onsuccess = function(event) {
      var cursor = event.target.result;
      if (cursor) {
          if (cursor.value.column.indexOf(keyword) !== -1) {
              console.log("We found a row with value: " + JSON.stringify(cursor.value));
          }

          cursor.continue();
      }
  };
}
