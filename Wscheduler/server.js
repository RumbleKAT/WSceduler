var http = require('http');
var express = require("express");
var sql = require("mssql");
var bodyParser = require('body-parser');
var fs = require('fs');
var ejs = require("ejs");
var router = express.Router();

var config = {
  user: "MJSONG",
  password: "0000",
  server: "127.0.0.1",
  database: "MJSONGEXAM",
  stream: true,

  options: {
    encrypy: true
  }
}


var app = express();
app.use(express.static('public'));
app.use(express.bodyParser());
app.use(app.router);

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'ejs');


app.get('/new', function(request, response){
fs.readFile('index.ejs','utf8',function(error,data){
  response.writeHead(200,{'content-type' : 'text/html'});
  response.end(ejs.render(data,{
    user: "Great User",title:"homepage"
  }));
});
});

app.get("/checkID",function(request,response){
  var responseResult;
  var count = 0;
  var CheckID = new Array(count);
  var userID = request.param('userID');
  var query = "select * from Join_Member ";
  console.log(userID);

  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query(query);

    request.on('row', function(row){
      CheckID[count] = row.ID;
      count++;
    });

      request.on('done',function(returnValue){
        for(var i = 0;i<count;i++)
        {
          responseResult += "/" + CheckID[i] ;
        }
        response.send(responseResult); //스케줄을 조절하는 페이지를 버튼으로 이동
      });
  });
});

app.post("/signupAction",function(request,response){

  var ID =  request.param('userID');
  var PASS = request.param('userPASS');
  var NAME =  request.param('userNAME');
  var EMAIL =  request.param('userEMAIL');
  var TEL = request.param('userPHONE');
  var NO = '10';

  var query = "INSERT INTO Join_Member (no,ID,PASS,NAME,EMAIL,TEL) VALUES ('"+NO+"','"+ ID +"','"+PASS+"','"+NAME+"','"+EMAIL+"','"+TEL+"')";
  console.log(query);

  sql.connect(config, function(err){
  //  console.log(ID);
    var request = new sql.Request();
    request.stream = true;
    request.query(query);

    var result = NAME +"님 가입을 축하합니다."; //시간을 다루는 페이지로 이동

  //  var data = "<html><head><title>JOIN_TO_WSCHEDULER</title></head>"
    //data += "<h1>"+result+"</h1>";

    request.on('done',function(returnValue){
      //data += "</html>";
      response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });

});


app.get("/select",function(request,response){
  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query('select * from member');

    var data = "<html><head><title>mssql test</title></head>"
    data += "<h1>TEST</h1>"
    data += "<table border = 1>";
    data += "<tr><th>ID</th><th>PASS</th></tr>"

    request.on('row', function(row){
      data += "<tr>"
      data += "<td>" + row.ID + "</td>"
      data += "<td>" + row.PASS + "</td>"
      data += "</tr>"
    });

    request.on('done', function(returnValue){
      data += "</table></html>"
      response.send(data);
    });
  });
});

http.createServer(app).listen(8080, function(){
  console.log("Server Running at http://127.0.0.1:8080");
});
