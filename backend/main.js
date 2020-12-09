// load the libs
const express = require('express')
const AWS = require('aws-sdk');
const fs = require('fs')

var multer = require('multer');
// var multipart = multer({dest: path.join(__dirname + '/uploads/')});
var multipart = multer({dest: 'uploads/'});

const config = require('./config.json');
AWS.config.credentials = new AWS.SharedIniFileCredentials('day24workshop');

const endpoint = new AWS.Endpoint('fra1.digitaloceanspaces.com');

const s3 = new AWS.S3({
    endpoint: endpoint,
    accessKeyId: config.accessKeyId || process.env.ACCESS_KEY,
    secretAccessKey: config.secretAccessKey
    || process.env.SECRET_ACCESS_KEY
});

// configure port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// create an instance of the application
const app = express()   
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/uploads'));

// upload file
app.post('/upload', multipart.single('img-file'),
    (req, resp) => {

        // if (!req.file) {
        //     console.log("No file received");
        //     return resp.send({
        //       success: false
        //     });
        
        //   } else {
        //     console.log('file received');
        //     return resp.send({
        //       success: true
        //     })
        //   }

        fs.readFile(req.file.path, (err, imgFile) => {
            
            // put object configurations
            const params = {
                Bucket: 'day24workshop',
                Key: req.file.filename,
                Body: imgFile,
                ACL: 'public-read',
                ContentType: req.file.mimetype,
                ContentLength: req.file.size,
                Metadata: {
                    originalName: req.file.originalname,
                    author: 'kingston',
                    update: 'a short note',
                }
            }

            s3.putObject(params, (error, result) => {
                return resp.status(200)
                .type('application/json')
                .json({ 'key': req.file.filename });
            })
        })
    }
);
  
// get file
app.get('/blob/:id', multipart.single('img-file'),
    (req, resp) => {
            
            // get object configurations
            const params = {
                Bucket: 'day24workshop',
                Key: id, // param of picture url
            }

            s3.getObject(params, (error, result) => {

                return resp.status(200)
                 .type('application/json')
                 .json(result);
            })
    }
);


// start the server
app.listen(PORT, () => {
    console.info(`Application started on port ${PORT} at ${new Date()}`)
})