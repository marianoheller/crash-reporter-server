// server.js
require('dotenv').config()
const dir = './crash-data';

// init project
const express = require('express');
const app = express();
const fs = require('fs');
var rimraf = require('rimraf');
var bodyParser = require('body-parser')


const multer  = require('multer');
if (!fs.existsSync(dir)) fs.mkdirSync(dir);
const upload = multer({ dest: dir });

var parser = bodyParser.urlencoded({ extended: false });

// http://expressjs.com/en/starter/static-files.html
app.use(express.static('public'));




/***********************************************************************************************************
 * PAGES
 */


// http://expressjs.com/en/starter/basic-routing.html
app.get("/", function (req, res) {
	res.sendFile(__dirname + '/views/index.html');
});


app.post("/dashboard", parser ,function (req, res) {
	if (!req.body) return res.sendStatus(400);
	if ( !req.body.username || !req.body.password ) return res.redirect('/');
	if ( req.body.username !== process.env.USERNAME && req.body.password !== process.env.PASSWORD ) return res.redirect('/');
	
	res.sendFile(__dirname + '/views/dashboard.html');
});


/***********************************************************************************************************
 * API
 */

 app.get("/api/crash/all", function( req, res) {
	fs.readdir(dir, (err, files) => {
		return res.json({
			files: files.map( (file) => ({
						company: file._companyName,
						product: file._productName,
						version: file._version,
						platform: file.platform,
						timestamp: file.timestamp
					}))
					.sort( (a,b) => a.timestamp-b.timestamp)
		});
	});
 });


// upload crash report 
app.post("/api/crash/clean", parser ,function (req, res) {
	if (!req.body) return res.sendStatus(400);
	if ( !req.body.username || !req.body.password ) return res.redirect('/');
	if ( req.body.username !== process.env.USERNAME && req.body.password !== process.env.PASSWORD ) return res.redirect('/');
	
	rimraf(dir, function (err) { 
		if (err) return res.sendStatus(400);
		return res.sendStatus(200);
	});
});


// upload crash report 
app.post("/api/crash/new", upload.single('upload_file_minidump') ,function (req, res) {
	if (!req.body) return res.sendStatus(400);
	//Parse data
	req.body.filename = req.file.filename
	const crashData = JSON.stringify(req.body);
	//Append extra data
	crashData.timestamp = Date.now();
	//Save file
	fs.writeFile(`${req.file.path}.json`, crashData, (e) => {
		if (e) return console.error(`Cant write: ${e.message}`);
		console.info(`crash written to file:\n\t ${crashData}`);
	})
	res.end();
});



app.listen(3000, () => {
	console.log("running on port 3000");
})
