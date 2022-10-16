import express from 'express';
const server = express();

server.all('/', (req, res)=>{
   res.setHeader('Content-Type', 'text/html');
   res.write("Deployment activated!!");
   res.end();
});

const keepActive = () => {
   server.listen(3000, () => {
      console.log("Server is active!!");
   });
};

export { keepActive };
