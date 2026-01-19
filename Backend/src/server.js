import express from 'express';
import cors from 'cors';
import contractRouter from './Routes/contractRoute.js';
const app = express();
const port = 3000;
app.use(cors());
app.use(express.json());
app.use("/api",contractRouter)
app.listen(port, () => {
    console.log('Server is running on port 3000');
});