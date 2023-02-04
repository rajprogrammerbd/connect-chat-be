import dotenv from 'dotenv';
dotenv.config();

import { WebSocketServer } from 'ws';
import http from 'http';
import express, { Express } from 'express';
import cors from 'cors';
import consola from 'consola';
import debug from 'debug';
import morgan from 'morgan';
import timeout from 'connect-timeout';
import compression from 'compression';

// Import all the routes
import homerouter from './routes/homepage.route';

// Debug logger.
const port_log = debug('listen:port');

const app: Express = express();

// Middlewares integration.
app.use(cors());
app.use(express.json());
app.use(compression());
app.use(timeout('15s'));
app.use(morgan('combined'));

app.use('/', homerouter);

const server = http.createServer(app);
const wsServer = new WebSocketServer({ server });

const port = process.env.PORT || 3001;

wsServer.on('connection', (socket: WebSocket) => {
  socket.send('Connect successfully');
});

server.listen(port, () => {
  consola.success('Server is running');
  port_log(`Server is running at http://localhost:${port}`);
});