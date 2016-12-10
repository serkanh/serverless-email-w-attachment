'use strict';

console.log('Loading function');


const aws = require('aws-sdk');
const fs = require('fs');
const s3 = new aws.S3({ apiVersion: '2006-03-01' });


module.exports.sendemail = (event, context, callback) => {

    // Get the object from the event and show its content type
	
    const bucket = event.Records[0].s3.bucket.name 
    const key = decodeURIComponent(event.Records[0].s3.object.key.replace(/\+/g, ' ')) 
	var params = {Bucket: bucket, Key: key};
	

	var nodemailer = require('nodemailer');
	var ses = require('nodemailer-ses-transport');
	var transporter = nodemailer.createTransport({
    	transport: 'ses', // loads nodemailer-ses-transport˜
	});

	var fileName = key.split("/")[1]
	var mailOptions = {
			sender: process.env.SENDER, 
			from: process.env.FROM,
			to: process.env.TO,
			cc: process.env.CC,
			contentType: 'text/csv',
			attachments: [
				{  
					path: '/tmp/'+fileName
				}
			]
	}
	

	var file = require('fs').createWriteStream('/tmp/'+fileName);	
	var stream = s3.getObject(params).createReadStream();
	stream.pipe(file);
	stream.on('error', (e) => console.log(e))
	stream.on('finish', () => 
		// send mail with defined transport object
		transporter.sendMail(mailOptions, function(error, info){
			if(error){
				return console.log(error);
			}
			console.log('Message sent: ' + info.response);
		})
	)
			

};
