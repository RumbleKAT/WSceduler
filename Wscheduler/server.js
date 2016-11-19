var http = require('http');
var express = require("express");
var sql = require("mssql");
var bodyParser = require('body-parser');
var fs = require('fs');
var ejs = require("ejs");
//var Cookies = require("cookies");
require("date-utils");

var dt = new Date();
var nowTime = dt.toFormat('YYYY-MM-DD'); // 현재시간을 알아냄
var future = Date.tomorrow();
future = future.toFormat('YYYY-MM-DD'); // 미래의 시간을 알아냄
console.log(future);
var router = express.Router();
var nowID ='';
var nowPASS ='';
var nowEMAIL = '';
var nodemailer = require('nodemailer');

//smtp 프로토콜 사용
var transporter = nodemailer.createTransport( {
   host: "smtp.gmail.com", // hostname
   secureConnection: true, // use SSL
   port: 465, // port for secure SMTP
   auth: {
       user: "reki318@gmail.com",
       pass: "ruki9179@"
   }
});

//mssql 연결
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
  //app.use(cookieParser());
  app.use(express.static('public'));
  app.use(express.bodyParser());
  app.use(app.router);
  app.engine('html', require('ejs').renderFile);
  app.set('view engine', 'ejs');
//로그인 부분 체크  - 전역변수로 ID,PASS,EMAIL을 가져옴

 app.get("/checkschedule",function(request,response){
   //  nowuser 로그인을 하면 뜨는 걸로
   // 일정을 분석하고 현재 날짜와 만약 현재 날짜보다 하루 늦으면 메일을 발송
   var result = '';
   var userID = request.param('userID');
   var userPASS = request.param('userPASS');

   var query ="select ID,PASS,EMAIL from Member where ID="+"'"+userID+"'"+"AND PASS="+"'"+userPASS+"'";

   sql.connect(config, function(err){
     var request = new sql.Request();
     request.stream = true;
     console.log(userID);
     request.query(query);

     request.on('row', function(row){
          nowID = row.ID
        nowPASS = row.PASS
        nowEMAIL = row.EMAIL
        result = nowID + "/" + nowPASS;
     });

       request.on('done',function(returnValue){
          response.send(result);
          console.log(nowID);
        });
      });
  });
//ejs부분 -안사용
 app.get('/new', function(request, response){
   fs.readFile('index.ejs','utf8',function(error,data){
     response.writeHead(200,{'content-type' : 'text/html'});
     response.end(ejs.render(data,{
       user: "Great User",title:"homepage"
     }));
   });
 });
//메모를 로딩하는 부분
app.get("/mailtouser",function(request,response){

  var userID = request.param('userID');
  var email ='';
  future = '2016-11-18';
  var prequery = "select M.EMAIL,MM.MEMO from Member M ,MemberMemo2 MM where M.ID = MM.ID AND M.ID="+"'"+userID+"'"+"AND MM.DATEU="+"'"+future+"'";
  console.log(prequery);
  var email = '';

  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query(prequery);

    request.on('row', function(row){
        memo = row.MEMO
        email = row.EMAIL
        console.log(memo);
        console.log(email);
    });

      request.on('done',function(returnValue){
        var result ='';
        var mailOptions = {
            from: '"송명진" <reki318@gmail.com>',
            to: email,
            subject: '해야하는일',
            text: memo
        };

        transporter.sendMail(mailOptions, function(error, info){
            if(error){
                return console.log(error);
            }
            console.log('Message sent: ' + info.response);
            result = info.response;
      });
        response.send(result);
    });
});
});


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
  var ID = decodeURIComponent(request.param('userID'));
  //var ID =  'ssj382';
  var email ='';
  var Memo = '';
  var title = '';
  var content = '';
  //쿠키나 정보를 저장해야함

    var query2 = "select MEMO from MemberMemo2 where DATEU = " +"'"+ DATE+"'" + "AND ID =" +"'"+ ID + "'";//로드 될떄
    console.log(query2);

    sql.connect(config, function(err){
      var request = new sql.Request();
      request.stream = true;
      request.query(query2);

      request.on('row', function(row){
        Memo = row.MEMO
      });

      request.on('done',function(returnValue){
        var result = Memo;
        response.send(result);
      });
    });
});
//데이터를 삭제하는 부분
  app.get('/delete',function(request,response){
    var title = decodeURIComponent(request.param('title'));
    var content = decodeURIComponent(request.param('content'));
    var userID = decodeURIComponent(request.param('userID'));
    var showDate = decodeURIComponent(request.param('showDate'));
    var deletememo = title + '//'+ content;

    var query =  'delete from MemberMemo2 where MEMO = '+"'"+deletememo+"'"+"and ID="+"'"+userID+"'"+"and DATEU="+"'"+showDate+"'";

    sql.connect(config, function(err){
      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('done',function(returnValue){
        result = "삭제되었습니다";
        response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });

  });

//수정하는 부분
  app.get('/edit',function(request,response){
    var title = decodeURIComponent(request.param('title'));
    var content = decodeURIComponent(request.param('content'));
    var userID = decodeURIComponent(request.param('userID'));
    var showDate = decodeURIComponent(request.param('showDate'));
    var editmemo = title + '//' + content; //두개를 합침

    var query = "update MemberMemo2 set MEMO="+"'"+ editmemo + "'" + "where ID=" + "'" + userID + "'" + "and DATEU = "+"'" +showDate+"'";
    console.log(query);

    sql.connect(config, function(err){
      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('done',function(returnValue){
        result  = "변경되었습니다";
        response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});

//수정 삭제 부분 만들기
/*
delete from department
where deptno = 4

update EMPLOYEE
set dno = 3 , salary = salary * 1.05
where EMPno = 2106
*/

app.get("/sendWork",function(request,response){
    var DATE = decodeURIComponent(request.param('eventDate'));
    var MEMOCONTENT = decodeURIComponent(request.param('eventContent'));
    var MEMOTITLE = decodeURIComponent(request.param('eventName'));
    var MEMO = MEMOTITLE + '//' + MEMOCONTENT; //두개를 합침

    var query = "INSERT INTO MemberMemo2 (ID,DATED,MEMO) VALUES ('"+ userID +"','"+DATE+"','"+MEMO+"')";

    sql.connect(config, function(err){

      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('done',function(returnValue){
        response.send(query); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});

app.post("/signupAction",function(request,response){

  var ID =  request.param('userID');
  var PASS = request.param('userPASS');
  var NAME =  request.param('userNAME');
  var EMAIL =  request.param('userEMAIL');
  var TEL = request.param('userPHONE');
  nowuser = ID;
  var query = "INSERT INTO Member (ID,PASS,NAME,EMAIL,TEL) VALUES ('"+ ID +"','"+PASS+"','"+NAME+"','"+EMAIL+"','"+TEL+"')";
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

http.createServer(app).listen(8080, function(){
  console.log("Server Running at http://127.0.0.1:8080");
});

/*
var mailOptions = {
    from: '"송명진" <reki318@gmail.com>',
    to: 'reki318@naver.com',
    subject: '해야하는일',
    text: memo
};

transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
*/
