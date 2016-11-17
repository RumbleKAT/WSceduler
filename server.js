var http = require('http');
var express = require("express");
var sql = require("mssql");
var bodyParser = require('body-parser');
var fs = require('fs');
var ejs = require("ejs");
var router = express.Router();
var nowuser = '';
var nowTime = '2016-11-16';
var nodemailer = require('nodemailer');

//구글 메일을 보내는 셋
var transporter = nodemailer.createTransport( {
   host: "smtp.gmail.com", // hostname
   secureConnection: true, // use SSL
   port: 465, // port for secure SMTP
   auth: {
       user: "reki318@gmail.com",
       pass: "ruki9179@"
   }
});
//mssql을 연결하는 셋
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

//알람 로직
//전체 메모 날짜와 ID를 받고
//ID를 토대로 Email주소를 받음
//smtp와 카카오톡 sdk를 이용한 알람

  app.get('/new', function(request, response){
    fs.readFile('index.ejs','utf8',function(error,data){
      response.writeHead(200,{'content-type' : 'text/html'});
      response.end(ejs.render(data,{
        user: "Great User",title:"homepage"
      }));
    });
  });

app.post("/checkschedule",function(request,response){
 //  nowuser 로그인을 하면 뜨는 걸로
 // 일정을 분석하고 현재 날짜와 만약 현재 날짜보다 하루 늦으면 메일을 발송

 var query = "select Member.EMAIL, MemberMemo.MEMO from Member join MemberMemo on (Member.ID = MemberMemo.ID) where MemberMemo.ID ="+"'"+ID+"'"+"and MemberMemo.DATED="+"'"+DATED+"'";

 sql.connect(config, function(err){
   var request = new sql.Request();
   request.stream = true;
   request.query(query);

   var email = '';
   var memo = '';

   request.on('row', function(row){
     email = row.EMAIL
     memo = row.MEMO
   });

     request.on('done',function(returnValue){
       console.log(email + memo);
       response.send(responseResult); //스케줄을 조절하는 페이지를 버튼으로 이동
     });
   });
});

/*
var mailOptions = {
    from: '"송명진" <reki318@gmail.com>',
    to: 'reki318@naver.com',
    subject: '해야하는일',
    text: Memo
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});

*/


app.get("/checkID",function(request,response){
  var responseResult;
  var count = 0;
  var CheckID = new Array(count);
  var userID = request.param('userID');



  var query = "select * from Member ";
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

app.get("/getWork",function(request,response){
  var DATE = decodeURIComponent(request.param('showDate'));
  var BEFOREDATE = decodeURIComponent(request.param('beforeDate'));
  var ID =  'ssj382';
  var Memo = '';
  var title = ''; //제목과 내용을 분리
  var content = '';


    var query2 = "select MEMO from MemberMemo where DATED = " +"'"+ DATE+"'" + "AND ID =" +"'"+ ID + "'";//로드 될떄
    console.log(query2);

    sql.connect(config, function(err){
      var request = new sql.Request();
      request.stream = true;
      request.query(query2);

      request.on('row', function(row){
        Memo = row.MEMO
      });

      request.on('done',function(returnValue){
        response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
      });
    });
});
//메모를 저장하는 부분
app.get("/sendWork",function(request,response){
    var ID =  'ssj382';
    var DATE = decodeURIComponent(request.param('eventDate'));
    var MEMOCONTENT = decodeURIComponent(request.param('eventContent'));
    var MEMOTITLE = decodeURIComponent(request.param('eventName'));
    var MEMO = MEMOTITLE + '//' + MEMOCONTENT; //두개를 합침

    var query = "INSERT INTO MemberMemo (ID,DATED,MEMO) VALUES ('"+ ID +"','"+DATE+"','"+MEMO+"')";

    sql.connect(config, function(err){

      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('done',function(returnValue){
        response.send(query); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});
//사용자 회원가입 부분
app.post("/signupAction",function(request,response){

  var ID =  request.param('userID');
  var PASS = request.param('userPASS');
  var NAME =  request.param('userNAME');
  var EMAIL =  request.param('userEMAIL');
  var TEL = request.param('userPHONE');
  //var NO = '11';
  nowuser = ID;
  var query = "INSERT INTO Member (ID,PASS,NAME,EMAIL,TEL) VALUES ("+ ID +"','"+PASS+"','"+NAME+"','"+EMAIL+"','"+TEL+"')";
  console.log(query);

  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query(query);

    var result = NAME +"님 가입을 축하합니다."; //시간을 다루는 페이지로 이동

    var data = "<html><head><title>Welcome_WSCHEDULER</title></head>"
    data += "<h1>"+result+"</h1>";
    data += "<a href=/index.html>" + "처음 페이지에서 로그인해주세요!" + "</a>";

    request.on('done',function(returnValue){
      data += "</html>";
      response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });

});

//전체 테이블을 보여주는 창
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
      data += "<td>" + row.NAME + "</td>"
      data += "<td>" + row.EMAIL + "</td>"
      data += "<td>" + row.TEL + "</td>"
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
