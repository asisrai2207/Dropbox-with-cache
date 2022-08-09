/**********************************************
 * Dropbox Challenge
 * ==================================
 ***********************************************/

// The purpose of this challenge is to ensure that you solidify your understanding of Node.js, as well as connect the frontend files to the backend.

/** # SETUP #
/*  ================== */
/** 1) Packages are already installed. Require them to this file */
const express = require("express");
const fs = require("fs");
const expressFileUpload = require("express-fileupload");
const path = require("path");

/** 2) set up app and port */
const app = express();
const port = 3000;
/** # Configure App #
/*  ====================== */
/** 3) Configure Application */

app.use(express.urlencoded({ extended: false }));
app.use(expressFileUpload());
const uploadDirectory = __dirname + path.sep + "uploaded";

app.use(express.static("uploaded"));
app.use(express.static("public"));
let caches = {};

/** # Read File #
/*  ====================== */
/** 4) Create a readfile function */

// readFile is a function which takes the file as an input, it goes to the 'uploaded' directory
// that we serve via express. It will then look for the name of the file that we pass into the function,
// the promise will resolve with the body of the file (the data)

// Remember, a promise is an object that tells you whether an action
// is successful or not.  It accepts two arguments: resolve and reject
// Resolve: if the job finishes, the promise will return a resolve object
// Reject: if an error occurs, the promise will return an error object

function readFile(file) {
  console.log("readFile function running");
  console.log("Reading to directory: " + uploadDirectory + "/" + file);
  return new Promise((resolve, reject) => {
    // CODE BELOW THIS LINE
    // fs.readFile
    fs.readFile(uploadDirectory + "/" + file, (err, body) => {
      if (err) {
        return reject("Error");
      } else {
        console.log("Body: ", body);
        resolve(body);
      }
    });
  });
}

/** # Write File #
/*  ====================== */

/** 5) Create a write file function */

// writeFile is a function which takes the name of the file and the body (data)
// for storage - it will write the file to our uploadDirectory 'uploaded'
// this promise resolves with the name of the file

function writeFile(name, data) {
  console.log("writeFile function running");
  console.log("Writing to directory: " + uploadDirectory + "/" + name);
  return new Promise((resolve, reject) => {
    // fs.writeFile
    fs.writeFile(uploadDirectory + "/" + name, data, (err) => {
      if (err) {
        return reject("Error");
      } else {
        console.log(name);
        resolve(name);
      }
    });
  });
}

/** # GET Method: Render index.html #
/*  ====================== */
/** 6) Render HTML page */

app.get("/", (req, res) => {
  console.log("GET Method: index.html");
  // CODE BELOW THIS LINE
  res.sendFile(__dirname + "/pages/index.html");
});

/** # POST Method: Upload to /files #
/*  ====================== */
/** 7) Post Data */

app.post("/files", (req, res) => {
  console.log("POST Method: " + req.files.upload.name);
  if (req.files.upload) {
    let file = req.files.upload;
    console.log("POST Method: " + file.name);
    writeFile(file.name, file.data) //calling writFile function to add the file data and file name
      .then(readFile)
      .then((data) => {
        caches[file.name] = data; //save the data on cache
        console.log(caches);
      });
    res.set("content-Type", "text/html");
    res.writeHead(200);
    res.write(`You have uploaded the file: ${file.name} </br>`);
    res.write(
      `To download, go to: http:localhost:${port}/uploaded/${file.name} </br> </br>`
    );
    res.write(`<button><a href="/">Return Home</a></button></br> </br>`);
    res.write(
      `To View all the files uploaded please click the button below </br> </br>`
    );
    res.end(`<button><a href="/directory">Directory</a></button></br>`);
    console.log(`The file: ${file.name} was uploaded to the server.`);
  } else {
    res.redirect("/");
  }
});

/** # GET Method: See the file you uploaded #
/*  ====================== */
/** 8) Get Data */

app.get("/uploaded/:name", (req, res) => {
  console.log("GET method: uploaded/:name");
  const params = req.params.name;
  if (caches[params]) {
    res.send(caches[params]); // if the caches has the uploaded file than it will send the file
  } else if (fs.existsSync(uploadDirectory + "/" + params)) {
    //The fs.existsSync() method is used to synchronously check if a file already exists in the given path
    readFile(params).then((data) => {
      caches[params] = data;
    });
    res.send(caches[params]);
  } else {
    res.redirect("/");
  }
});

//To display files listed on the directory
app.get("/directory", (req, res) => {
  console.log("GET method: Directory");
  fs.readdir(uploadDirectory, (err, files) => {
    if (err) {
      console.log(err);
      reject("Error");
    } else {
      files.forEach((file) => {
        console.log(`\nFilenames: ${file}`);
        res.write(`\nFilenames: ${file}`);
      });
      res.end();
    }
  });
});

/** # Connecting to Server #
/*  ====================== */

app.listen(port, () => {
  console.log(`Connected to server! Go to localhost: ${port}`);
});
