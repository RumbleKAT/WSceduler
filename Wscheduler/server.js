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
//console.log(future);

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

app.get("/findID",function(request,response){
  var userID = request.param('userID');
  var query ="select ID from memberJoin where ID="+"'"+userID+"'";
  console.log(query);
  var result  = '';

    sql.connect(config, function(err){
      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('row', function(row){
           result = row.ID
      });

        request.on('done',function(returnValue){
           response.send(result);
         });
  });
});
//패스워드 확인
app.get("/findpass",function(request,response){
  var userID = request.param('userID');
  var nowpass = request.param('nowpass');
  var futurepass = request.param('futurepass');
  console.log(futurepass);
  var query = "update memberJoin set PASS="+"'"+ futurepass + "'" + "where ID=" + "'" + userID + "'" + "and PASS = "+"'" +nowpass+"'";
  console.log(query);

  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query(query);

    request.on('done',function(returnValue){
      var result = "비밀번호가 수정되었습니다!";

      response.send(result);

     });
   });


});
//회원가입 버튼을 누를시
app.get("/checkUSERID",function(request,response){
   //  nowuser 로그인을 하면 뜨는 걸로
   var result = '';
   var userID = request.param('userID');
   var userPASS = request.param('userPASS');

   var query ="select ID,PASS,EMAIL from memberJoin where ID="+"'"+userID+"'"+"AND PASS="+"'"+userPASS+"'";

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

//메모를 로딩하는 부분 메모를 찾는 부분과 사용자 정보를 찾는 부분을 만듬 -필
app.get("/mailtouser",function(request,response){
 // 멤버에서 멤버조인을 찾는 부분을 하고 이거 뒤에
 // 멤버 메모에서 메모와 데이트를 찾음 이거 먼저
  var userID = 'reki318'; //request.param('userID');
  var email ='';
  future = '2016-11-23';
  var prequery = "select M.EMAIL,MM.MEMO from Member M ,MemberMemo2 MM where M.ID = MM.ID AND M.ID="+"'"+userID+"'"+"AND MM.DATEU="+"'"+future+"'";
  console.log(prequery);
  var memo = '';

  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query(prequery);

    request.on('row', function(row){
        memo = row.MEMO
        email = row.EMAIL
    });

      request.on('done',function(returnValue){
        console.log(memo);
        console.log(email);
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

//카카오 로그인 부분
app.get("/kakaoSelect",function(request,response){
  var KakaoID = request.param('kakaoID');

  var result = ''; //멤버넘버를 저장하는 변수
  var query = "select ID from KakaoJoin where ID = " +"'"+ KakaoID+"'" ;//로드 될떄
  console.log(query);
  sql.connect(config, function(err){

    var request = new sql.Request();
    request.stream = true;
    request.query(query);

    request.on('row', function(row){
      result = row.ID;
    });

    request.on('done',function(returnValue){
      response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});


//member테이블로 연결할때 사용하는 부분
app.get("/ConnectMemberKakao",function(request,response){
  var kakaoID = request.param('kakaoID');//카카오 ID를 입력
  var result = ''; //멤버넘버를 저장하는 변수
  var query = "select MemberNo from member where Kakao_ID = " +"'"+ kakaoID+"'" ;//로드 될떄
  console.log(query);

  sql.connect(config, function(err){

    var request = new sql.Request();
    request.stream = true;
    request.query(query);


    request.on('row', function(row){
      result += row.MemberNo;
    });

    request.on('done',function(returnValue){
      result += "////";
      response.send(result); //멤버 넘버가 부여
  });
});
});
//메모 버튼을 토대로 메모테이블의 데이터를 가져옴
app.get("/ConnectMEMO",function(request,response){
    var MEMONO = request.param('MEMONO');//카카오 ID를 입력
    var result = '';
    var query = "select MEMO, MEMODATE from member where MEMONO = " +"'"+ MEMONO+"'" ;//로드 될떄

    sql.connect(config, function(err){

      var request = new sql.Request();
      request.stream = true;
      request.query(query);


      request.on('row', function(row){
        result += "MEMO=";
        result += row.MEMO;
        result += "MEMODATE="
        result += row.MEMODATE;
        result += "END";
      });

      request.on('done',function(returnValue){
        response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
      });
    });

});
//멤버테이블과 연결
app.get("/ConnectMember",function(request,response){
  var userID = decodeURIComponent(request.param('userID'));//카카오 ID를 입력
  var result = ''; //멤버넘버를 저장하는 변수
  var query = "select MemberNo from member where Join_ID = " +"'"+ userID+"'" ;//로드 될떄

  sql.connect(config, function(err){

    var request = new sql.Request();
    request.stream = true;
    request.query(query);


    request.on('row', function(row){
      result += row.MemberNo;
    });

    request.on('done',function(returnValue){
      result += '////';
      response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});

//카카오 테이블 삽입 부분
app.get("/kakaoInsert",function(request,response){
    var kakaoID = decodeURIComponent(request.param('KakaoID'));
    var kakaoNick = decodeURIComponent(request.param('kakaoNick'));
    var query = "INSERT INTO KakaoJoin (ID,NICKNAME) VALUES ('"+ kakaoID + "','" + kakaoNick +"')";
    console.log(query);
    var result  ='';

    sql.connect(config, function(err){

      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('done',function(returnValue){
        result = "KakaoJoin테이블에 정보입력!"
        response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});

//카카오 테이블 삽입 부분
app.get("/memberInsertKakao",function(request,response){
    var kakaoID = request.param('KakaoID');

    var query = "INSERT INTO member (Kakao_ID) VALUES  ('"+ kakaoID +"'"+")";
    var result  ='';
    console.log(query);

    sql.connect(config, function(err){

      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('done',function(returnValue){
        result = "Kakao정보를 member테이블에 정보입력!"
        response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});

//카카오 테이블 삽입 부분
app.get("/memberInsertJoin",function(request,response){
    var Join_ID = request.param('Join_ID');
    var Kakao_ID = '';

    var query = "INSERT INTO member (Join_ID) VALUES ('"+ Join_ID +"'"+")";
    var result  ='';
    console.log(query);

    sql.connect(config, function(err){

      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('done',function(returnValue){
        result = "Join_ID정보를 member테이블에 정보입력!"
        response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});




//아이디중복확인
app.get("/checkID",function(request,response){
  var result = '';
  var userID = request.param('userID');
  var query = "select ID from memberJoin where ID="+"'"+userID+"'";

  console.log(query);

  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query(query);

    request.on('row', function(row){
      result = row.ID;
    });

      request.on('done',function(returnValue){
        response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
      });
  });
});

//메모를 불러오는 부분 -필
app.get("/getWork",function(request,response){
  var DATE = decodeURIComponent(request.param('showDate'));
  var ID = decodeURIComponent(request.param('userID'));
  var email ='';
  var Memo = '';
  var title = '';
  var content = '';
  //쿠키나 정보를 저장해야함
  //조인해야함
    var query2 = "select MEMO from MEMO where MEMODATE = " +"'"+ DATE+"'" + "AND ID =" +"'"+ ID + "'";//로드 될떄
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
//데이터를 삭제하는 부분 -필
app.get('/delete',function(request,response){
    var title = decodeURIComponent(request.param('title'));
    var content = decodeURIComponent(request.param('content'));
    var userID = decodeURIComponent(request.param('userID'));
    var showDate = decodeURIComponent(request.param('showDate'));
    var deletememo = title + '//'+ content;

    //조인해야됨
    var query =  'delete from MEMO where MEMO = '+"'"+deletememo+"'"+"and ID="+"'"+userID+"'"+"and DATEU="+"'"+showDate+"'";

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

//수정하는 부분 -필
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

//삽입하는 부분 -필
app.get("/sendWork",function(request,response){
    var DATE = decodeURIComponent(request.param('eventDate'));
    var MEMOCONTENT = decodeURIComponent(request.param('eventContent'));
    var MEMOTITLE = decodeURIComponent(request.param('eventName'));
    var userID = decodeURIComponent(request.param('loadID'));
    var MEMO = MEMOTITLE + '//' + MEMOCONTENT; //두개를 합침
    //메모 번호를 받고 쿠키에 저장 후 멤버 메모와 메모를 조인 후 합침
    var query = "INSERT INTO MemberMemo2 (ID,DATEU,MEMO) VALUES ('"+ userID +"','"+DATE+"','"+MEMO+"')";

    sql.connect(config, function(err){

      var request = new sql.Request();
      request.stream = true;
      request.query(query);

      request.on('done',function(returnValue){
        response.send(query); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});

//이미 있는 유저의 아이디를 입력 받아 쿠키로 전달
app.get("/getuser",function(request,response){
  var Join_ID = decodeURIComponent(request.param('Join_ID'));
  var Kakao_ID = decodeURIComponent(request.param('Kakao_ID'));
  var query = "select MemberNo from member where Join_ID = " +"'"+ Join_ID+"'" + "OR Kakao_ID =" +"'"+ Kakao_ID + "'";
  console.log(query);
  var result  = '';

  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query(query);

    request.on('row', function(row){
      result = row.MemberNo
    });

    request.on('done',function(returnValue){
      response.send(result);
    });
  });
});

//회원가입 하는부분
app.get("/signup",function(request,response){

  var ID =  decodeURIComponent(request.param('userID'));
  var PASS = decodeURIComponent(request.param('userPASS'));
  var NAME =  decodeURIComponent(request.param('userNAME'));
  var EMAIL =  decodeURIComponent(request.param('userEMAIL'));
  var TEL = decodeURIComponent(request.param('userPHONE'));
  var query = "INSERT INTO memberJoin (ID,PASS,NAME,EMAIL,TEL) VALUES ('"+ ID +"','"+PASS+"','"+NAME+"','"+EMAIL+"','"+TEL+"')";
  console.log(query);

  var result = NAME +"님 가입을 축하합니다."; //시간을 다루는 페이지로 이동

  sql.connect(config, function(err){
    var request = new sql.Request();
    request.stream = true;
    request.query(query);

    request.on('done',function(returnValue){
      response.send(result); //스케줄을 조절하는 페이지를 버튼으로 이동
    });
  });
});

http.createServer(app).listen(8080, function(){
  console.log("Server Running at http://127.0.0.1:8080");
});
