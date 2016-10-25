var sql = require('mssql');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var method_override = require('method-override');
var abonado = {};
var admin = "";
var m = [];
var d = [];
app.set("view engine","jade");
app.use(express.static("public"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(method_override("_method"));


//193465997

var config = {
  user: 'sa',
  password: '123456',
  server: '192.168.1.79', // You can use 'localhost\\instance' to connect to named instance
  database: 'servicios_municipalidad',
  port:'49170'
};

var configP = {
  user: 'sa',
  password: 'admin',
  server: 'localhost',
  database: 'pruebas',
};

app.get("/",function(req,res){
  res.render("index",{estado:{status:""}})
});

app.get("/user/pendientes",function(req,res){
  sql.connect(config).then(function(){
    var consulta = new sql.Request();
    consulta.input("inIDAbonado",sql.Int,abonado.id);
    consulta.execute("SP_GetRecibosPendientes").then(function(recordset){
      //console.log(recordset);
      //console.log(recordset[0]);
      res.render("user/pendientes",{user:abonado,recibos:recordset[0]});
    }).catch(function(err){
      console.log(err);
    })
  });
  //res.render("user/pendientes",{user:abonado});
});

app.get("/user/pagados",function(req,res){
  sql.connect(config).then(function(){
    var consulta = new sql.Request();
    consulta.input("inIDAbonado",sql.Int,abonado.id);
    consulta.execute("SP_GetRecibosPagados").then(function(recordset){
      //console.log(recordset);
      //console.log(recordset[0]);
      res.render("user/pagados",{user:abonado,recibos:recordset[0]});
    }).catch(function(err){
      console.log(err);
    })
  });
  //res.render("user/pagados",{user:abonado})
});

app.get("/user/consultar",function(req,res){
  res.render("user/consultar",{user:abonado,recibo:'null'})
});

app.get("/user/pagar",function(req,res){
  res.render("user/pagar",{user:abonado,recibo:0})
});

app.get("/admin", function(req,res){
  res.render("admin/index");
});

app.get("/admin/reconectar" ,function(req,res){
  sql.connect(config).then(function(){
    var consulta = new sql.Request();
    consulta.execute("SP_GetReconectar").then(function(recordset){
      //res.render("/admin/reconectar");
      res.render("admin/reconectar",{reconexiones:recordset[0]});
    }).catch(function(err){
      console.log(err);
    })
  });

});

app.get("/admin/reconectar/:id", function(req,res){
  sql.connect(config).then(function(){
    var consulta = new sql.Request();
    consulta.input("inIDAbonado",sql.Int,req.params.id);
    consulta.execute("SP_ReconectarAgua").then(function(recordset){
    }).catch(function(err){
      console.log(err);
    })
  });
  res.render("admin/profile")
});

app.get("/admin/morosidad", function(req,res){
  var distrito = [];
  sql.connect(config).then(function(){
    var consulta2 = new sql.Request();
    consulta2.execute("SP_DistritoMasMoroso").then(function(recordset){
        distrito = recordset[0][0];
        //console.log(recordset);
    }).catch(function(err){
      console.log(err);
    })
    var consulta1 = new sql.Request();
    consulta1.execute("SP_Morosos").then(function(recordset){
        //console.log("igualo abonados");
        res.render("admin/morosidad",{morosos:recordset[0],distritos:distrito});
    }).catch(function(err){
      console.log(err);
    })

  });

});

app.post("/user", function(req,res){
  sql.connect(config).then(function(){
    var consulta = new sql.Request();
    consulta.input("inDocID",sql.VarChar(50),req.body.carnet);
    consulta.execute("SP_LOGIN").then(function(recordset){
      if(recordset.returnValue > 0){
        abonado = recordset[0][0];
        res.render("user/profile",{user:abonado});
      }
      else{
        res.render("user/index",{estado:{status:"Carnet no registrado, por favor digíte uno válido"}})
      }
    }).catch(function(err){
      console.log(err);
    })
  });
});

app.post("/admin", function(req,res){
  if(req.body.user == admin && req.body.password == admin){
    res.render("admin/profile");
  }
  else {
    res.redirect("/admin")
  }
});

app.post("/user/consultar", function(req,res){
  sql.connect(config).then(function(){
    var consulta = new sql.Request();
    consulta.input("inReciboID",sql.Int,req.body.recibo);
    consulta.input("inAbonadoID",sql.Int,abonado.id);
    consulta.execute("SP_ConsultarRecibo").then(function(recordset){
      if(recordset.returnValue > 0){
        //abonado = recordset[0][0];
        res.render("user/consultar",{user:abonado,recibo:recordset[0][0]});
      }
      else{
        res.render("user/consultar",{user:abonado,recibo:recordset.returnValue})
      }
    }).catch(function(err){
      console.log(err);
    })
  });
});

app.post("/user/pagar", function(req,res){
  sql.connect(config).then(function(){
    var consulta = new sql.Request();
    consulta.input("inReciboID",sql.Int,req.body.recibo);
    consulta.input("inAbonadoID",sql.Int,abonado.id);
    consulta.execute("SP_PagarRecibo").then(function(recordset){
        res.render("user/pagar",{user:abonado,recibo:recordset.returnValue})
    }).catch(function(err){
      console.log(err);
    })
  });
});

app.listen(8081);

/*
app.get("/", function(req,res){
  console.log("entro a la f");
  sql.connect(config).then(function() {
    // Query

    new sql.Request().query('select * from Distritos').then(function(recordset) {
        console.dir(recordset);
    }).catch(function(err) {
        console.dir(err);
    });
  });
});
*/

/*app.get("/", function(req,res){
  sql.connect("mssql://sa:admin@localhost/servicios_municipalidad").then(function() {

      var consulta = new sql.Request();
      consulta.input('Nombre_Usuario',sql.VarChar(20),"json");
      consulta.input('Contra_Usuario',sql.VarChar(20),"json");
      consulta.execute('SP_Insertars').then(function(recordsets) {
          console.log(recordsets);
          res.render("temp");
      }).catch(function(err) {
          console.log(err);
        });
  });
});
*/
