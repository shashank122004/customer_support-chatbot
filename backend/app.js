import express from 'express';
import cors from 'cors';
import query from './routes/router.query.js';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// simple request logger
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} ${req.method} ${req.url}`);
    next();
});

// Sample route
app.get('/', (req, res) => {
    res.send('Hello World!');
});

app.use('/query', query);

export default app;