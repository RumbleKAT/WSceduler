var nodemailer = require('nodemailer');

// create reusable transporter object using the default SMTP transport

var transporter = nodemailer.createTransport( {
	 host: "smtp.gmail.com", // hostname
	 secureConnection: true, // use SSL
	 port: 465, // port for secure SMTP
	 auth: {
			 user: "reki318@gmail.com",
			 pass: "ruki9179@"
	 }
});

// setup e-mail data with unicode symbols
var mailOptions = {
    from: '"송명진" <reki318@gmail.com>', // sender address
    to: 'reki318@naver.com', // list of receivers
    subject: 'Hello ✔', // Subject line
    text: 'Hello world 🐴', // plaintext body
    html: '<b>Hello world 🐴</b>' // html body
};

// send mail with defined transport object
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        return console.log(error);
    }
    console.log('Message sent: ' + info.response);
});
