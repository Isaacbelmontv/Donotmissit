var db;
$(document).ready(function() {

  var openRequest = indexedDB.open("idbpreso_notes",1);

    openRequest.onerror = function(e) {
        alert('Error cargando la base de datos');
        console.dir(e);
    }

    openRequest.onupgradeneeded = function(e) {
        console.log("running onupgradeneeded");
        var thisDb = e.target.result;

        //Create Note
        if(!thisDb.objectStoreNames.contains("note")) {
            console.log("I need to make the note objectstore");
            var objectStore = thisDb.createObjectStore("note", { keyPath: "id", autoIncrement:true });
            objectStore.createIndex("title", "title", { unique: false });
        }

        //Create Log
        if(!thisDb.objectStoreNames.contains("log")) {
            console.log("I need to make the log objectstore");
            var objectStore = thisDb.createObjectStore("log", { keyPath: "id", autoIncrement:true });
        }
    }

    openRequest.onsuccess = function(e) {
        db = e.target.result;
        db.onerror = function(event) {
        /*mensaje de error*/
          alert("Database error: " + event.target.errorCode);
          console.dir(event.target);
        };
        displayNotes();
    }

    function displayNotes(filter) {

        var transaction = db.transaction(["note"], "readonly");
        var content="<table class='table table-bordered'><thead><tr><th><h3>Nombre</h3></th><th><h3>Genero</h3></th><th><h3>Fecha</h3></th></td></thead><tbody>";

    transaction.oncomplete = function(event) {
            $("#noteList").html(content);
        };

        transaction.onerror = function(event) {
          // Don't forget to handle errors!
          console.dir(event);
        };

        var handleResult = function(event) {
          var cursor = event.target.result;
          if (cursor) {
            content += "<tr data-key=\""+cursor.key+"\"><td class=\"notetitle\">"+cursor.value.title+"</td><td>"+cursor.value.genero+"</td><td>"+cursor.value.fecha+"</td>";/*impresion de datos*/
            content += "<td><a class=\"btnuno btn-primary edit\"><i class=\"fa fa-pencil\" aria-hidden=\"true\"></i></a></td>";
            content +=  "<td><a class=\"btndos btn-danger delete\"><i class=\"fa fa-trash-o\" aria-hidden=\"true\"></i></a></td>";
/*ejemplo con clases*/
/*content += "<td><a class=\"btn btn-primary edit\">Edit</a> <a class=\"btn btn-danger delete\">Delete</a></td>";
*/
            content +="</tr>";
            cursor.continue();
          }
          else {
            content += "</tbody></table>";
          }
        };


        var objectStore = transaction.objectStore("note");

        if(filter) {
            var range = IDBKeyRange.bound(filter, filter + "z");
            var index = objectStore.index("title");
            index.openCursor(range).onsuccess = handleResult;
        } else {
            objectStore.openCursor().onsuccess = handleResult;
        }
        doCount();
    }

    $("#noteList").on("click", "a.delete", function(e) {
        var thisId = $(this).parent().parent().data("key");

    var t = db.transaction(["note"], "readwrite");
    var request = t.objectStore("note").delete(thisId);
        request.onsuccess = function(event) {
            addLog("Deleted note "+thisId);
        };
    t.oncomplete = function(event) {
      displayNotes();
    }
        return false;
    });

    $("#noteList").on("click", "a.edit", function(e) {
        var thisId = $(this).parent().parent().data("key");

        var request = db.transaction(["note"], "readwrite")
                        .objectStore("note")
                        .get(thisId);
        request.onsuccess = function(event) {
            var note = request.result;
            $("#key").val(note.id);
            $("#title").val(note.title);
            $("#genero").val(note.genero);
            $("#fecha").val(note.fecha);
        };

        return false;
    });

    $("#noteList").on("click", "td", function() {
        var thisId = $(this).parent().data("key");
        var transaction = db.transaction(["note"]);
        var objectStore = transaction.objectStore("note");
        var request = objectStore.get(thisId);
        request.onerror = function(event) {
          console.dir(event);
        };
        request.onsuccess = function(event) {
          var note = request.result;
          $("#noteDetail").html("<h2>"+"Nombre: "+note.title+"</h2><p>"+"<b>Genero: </b> "+note.genero+"</p><p>"+"<b>Fecha: </b>"+note.fecha+"</p>");/*impresion span*/
        };
    });

    $("#addNoteButton").click(function() {
        var title = $("#title").val();
        var genero = $("#genero").val();
        var fecha = $("#fecha").val();
/*primary*/
        var key = $("#key").val();

    var t = db.transaction(["note"], "readwrite");

        if(key === "") {
            var request = t.objectStore("note")
                            .add({title:title,genero:genero,fecha:fecha});
        } else {
            var request = t.objectStore("note")
                            .put({title:title,genero:genero,fecha:fecha,id:Number(key)});
        }

        request.onsuccess = function(event) {
            $("#key").val("");
            $("#title").val("");
            $("#genero").val("");
            $("#fecha").val("");
            if(key === "") addLog("Added a note, id was "+event.currentTarget.result);
            else addLog("Edited note "+key);
            displayNotes();
        };

    t.oncomplete = function(event) {
      displayNotes();
    }

        return false;
    });

    $("#filterField").on("keyup", function(e) {
        var filter = $(this).val();
        displayNotes(filter);
    });

    function addLog(msg) {
        var logrequest = db.transaction(["log"], "readwrite")
                        .objectStore("log")
                        .add({log:msg,timestamp:new Date()});
        console.log("LOG: "+msg);
    }

    function doCount() {
        db.transaction(["note"],"readonly").objectStore("note").count().onsuccess = function(event) {
            $("#sizeSpan").text("Agregadas "+"( "+event.target.result+" )");
        }
    }
});
/**/
