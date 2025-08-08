import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import usersRouter from './users/routes.js';
import eventsRouter from './event/routes.js';
import './db/index.js';

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;
const host = '0.0.0.0';

app.use(cors());
app.use(express.json());
app.use('/users', usersRouter);
app.use('/event', eventsRouter);

app.listen(port, host, () => {
  console.info(`Server running at http://${host}:${port}`);
});

