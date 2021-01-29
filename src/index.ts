import express, {Express}from 'express';
import cors from 'cors';
import { AddressInfo } from "net";
import students from './Endpoints/students'
import teachers from './Endpoints/teachers'
import mission from './Endpoints/mission'

const app: Express = express();
app.use(express.json());
app.use(cors());

//endpoins here:
app.use('/student', students)
app.use('/teacher', teachers)
app.use('/mission', mission)

const server = app.listen(process.env.PORT || 3003, () => {
    if (server) {
       const address = server.address() as AddressInfo;
       console.log(`Server is running in http://localhost:${address.port}`);
    } else {
       console.error(`Failure upon starting server.`);
    }
 });