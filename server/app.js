const http = require("http");
const fs = require("fs");
const path = require("path");
const url = require("url");

const hostname = "127.0.0.1";
const port = 3000;

const server = http.createServer((req, res) => {    
    const urlParts = url.parse(req.url);
    const p = path.join(__dirname, "../docs/", urlParts.pathname);
    
    const stream = fs.createReadStream(p);
    stream.on("error", (err) => {
        console.log(err.message);
    });
    stream.on("end", (chunk) =>{
        console.log("sent " + p);
    })
    stream.pipe(res);

});

server.listen(port, hostname, () => {
    console.log(`Server running at http://${hostname}:${port}/`);
});

