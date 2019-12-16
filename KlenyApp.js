const csv = require('csv-parser');
const fs = require('fs');
var nodemailer = require('nodemailer');
var express = require('express');
const port = process.env.PORT || 8080;


var app = express();
app.use(express.json());

var results = [];
var records = [];

var transporter = nodemailer.createTransport({
		host: "smtp.mailtrap.io",
		port: 2525,
		auth: {
				user: "131bcc0af7ba7a",
				pass: "cd0808a0cd4aba"
		}
});

app.get('/', (req, res) => {
		fs.readFile('Index.html', function (err, data) {
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.write(data);
				return res.end();
		});
});

app.get('/api/results', (req, res) => {
		if (results.length == records.length) {
				res.send(results);
		}
});

app.post('/api/fileUpload', (req, res) => {
		console.log(req.body.Filename);
		fs.createReadStream(req.body.Filename)
				.pipe(csv())
				.on('data', (row) => {
						records.push(row);
				})
				.on('end', () => {
						console.log('CSV file successfully processed');
						console.log(records);
						//MailOperation(function (response) {
						//});
				});
		res.send(results);
		res.end();
});

app.listen(port, () => console.log(`Listening on port ${port}..`));

function MailOperation(callBack) {
		for (var i = 0; i < records.length; i++) {
				SendMail(records[i], function (response) {
						results.push(response);
						if (results.length == records.length) {
								return callBack(results);
						}
				});
		}
}

function SendMail(row, callBack) {
		var mailoptions = {
				from: 'ajithkumar1997k@gmail.com',
				to: row.EmailId,
				subject: 'Confirmation mail',
				text: '<p> Hey ' + row.Firstname + ',</p>' +
						'<p> Kindly confirm if the following details are correct. </p>' +
						'<br>' +
						'<span>Name 	: ' + row.Firstname + ' ' + row.Lastname + '</span><br>' +
						'<span>EmailId: ' + row.EmailId + '</span><br>' +
						'<span>Phoneno: ' + row.Phone + '</span><br>' +
						'<span>Address: ' + row.Address + '</span><br>' +
						'<span>Gender	: ' + row.Gender + '</span><br>' +
						'<br>' +
						'<br>' +
						'<p>Regards,</p>' +
						'<br>' +
						row.Firstname + ' ' + row.Lastname
		};
		transporter.sendMail(mailoptions, function (error, info) {
				if (error) {
						console.log(error);
						console.log(error);
				} else {
						info.Data = row;
						console.log('email sent: ' + info.response);
						return callBack(info);
				}
		});
}