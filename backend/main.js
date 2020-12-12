// load the libs
const express = require('express')
const AWS = require('aws-sdk');
const fs = require('fs')
const mysql = require('mysql2/promise')

const dotenv = require('dotenv').config()   // for using without encryption

// const secureEnv = require('secure-env')      //for encrypting the env file
// global.env = secureEnv({secret:'mySecretPassword'})

const imageType = require('image-type')

//SQL
const SQL_ADD_NEW_IMAGE = 'insert into images (image) values (?);'
const SQL_SELECT_IMAGE = 'select image from images where id = ?;'

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

const startApp = async (app, pool) => {
	const conn = await pool.getConnection()
	try {
		console.info('Pinging database...')
		await conn.ping()
		app.listen(PORT, () => {
			console.info(`Application started on port ${PORT} at ${new Date()}`)
		})
	} catch(e) {
		console.error('Cannot ping database', e)
	} finally {
		conn.release()
	}
}

// create connection pool
const pool = mysql.createPool({
	host: process.env.DB_HOST || 'localhost',
	port: parseInt(process.env.DB_PORT) || 3306,
	database: 'party',
	user: dotenv.DB_USER || process.env.DB_USER,    //use env only if using encrypted version
	password: dotenv.DB_PASSWORD || process.env.DB_PASSWORD,
	connectionLimit: 4
})

// configure port
const PORT = parseInt(process.argv[2]) || parseInt(process.env.PORT) || 3000

// create an instance of the application
const app = express()   
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(__dirname + '/uploads'));

// upload file to S3
app.post('/upload', multipart.single('image-file'),
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

        fs.readFile(req.file.path, async (err, imgFile) => {
            
            // put object configurations

            // post to digital ocean        
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
            // post to digital ocean continued
            s3.putObject(params, (error, result) => {

                console.info('filename',req.file.filename)
                return resp.status(200)
                .type('application/json')
                .json({ 'key': req.file.filename });
            })
        })

    }    
);
  
// upload file to SQL
app.post('/uploadToSQL', multipart.single('image-file'),
    (req, resp) => {

        fs.readFile(req.file.path, async (err, imgFile) => {
            
            // post blob to sql
            const conn = await pool.getConnection()
            try {
        
                await conn.beginTransaction() // to prevent only one DB from being updated
        
                await conn.query(
                    SQL_ADD_NEW_IMAGE, [imgFile],
                )
        
                await conn.commit()
        
                resp.status(200)
                resp.format({
                    html: () => { resp.send('Thank you'); },
                    json: () => { resp.json({status: 'ok'});}
        
                })
                    
            } catch(e) {
                conn.rollback()
                fs.unlink(req.file.path, ()=> { });
                resp.status(500).send(e)
                resp.end()
            } finally {
                conn.release()
            }
        })

    }    
);


// get file from S3
app.get('/blob/:id', (req, resp) => {
            
            const id = req.params.id
            console.info(id)
            // get object configurations
            const params = {
                Bucket: 'day24workshop',
                Key: id, // param of picture url
            }

                s3.getObject(params, (error, result) => {

                    if (error == null){
                        return resp.status(200)
                        .type('application/json')
                        .json(result);   
                    }
                    else {
                        console.info (error)
                        return resp.status(500)
                        .type('application/json')
                        .json(error);   
                    }
                })    
    }
);

// get image file from SQL
app.get('/sqlblob/:id', async (req, resp) => {
	const conn = await pool.getConnection()
	try {
		const [ results, _ ] = await conn.query(SQL_SELECT_IMAGE, [req.params.id])
       resp.status(200)
       resp.type(imageType(results[0].image).mime)
       console.info((results[0].image))
       resp.send((results[0].image));
        //     resp.status(200)
        //     .type('application/json')
        //     .json(results);   
        // console.info('try block')
	} catch(e) {    
        console.info('catch block')
		console.error('ERROR: ', e)
		resp.status(404)
		resp.end()
	} finally {
		conn.release()
	}
})

// start the server
startApp(app, pool)

// app.listen(PORT, () => {
//     console.info(`Application started on port ${PORT} at ${new Date()}`)
// })