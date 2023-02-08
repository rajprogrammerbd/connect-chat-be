import dotenv from 'dotenv'
dotenv.config()

import { WebSocketServer } from 'ws'
import http from 'http'
import express, { Express } from 'express'
import cors from 'cors'
import consola from 'consola'
import debug from 'debug'
import morgan from 'morgan'
import timeout from 'connect-timeout'
import compression from 'compression'
import { v4 as uuidv4 } from 'uuid'

// Import all the routes
import homerouter from './routes/homepage.route'
import UserLinkedList from './Data/users'
import MessageLinkedList from './Data/messages'

// Debug logger.
const port_log = debug('listen:port')

const app: Express = express()

// Middlewares integration.
app.use(cors())
app.use(express.json())
app.use(compression())
app.use(timeout('15s'))
app.use(morgan('combined'))

app.use('/', homerouter)

const server = http.createServer(app)
const wsServer = new WebSocketServer({ server })

const port = process.env.PORT || 3001

const user = new UserLinkedList()

wsServer.on('connection', socket => {
  socket.on('message', (data, isBinary) => {
    const d = isBinary ? data : data.toString()

    const parsed = JSON.parse(d as string)

    console.log('parsed data ', parsed)

    // Check if the user is new.
    if (parsed.newConnection) {
      if (parsed.name === undefined) {
        socket.send(
          JSON.stringify({
            connection: false,
            message: 'Failed to connect (Invalid request)',
          })
        )
      }
      // Generate a user id.
      const userId = uuidv4()
      const accessId = uuidv4()

      user.push({
        userName: parsed.name,
        accessId,
        userId,
        connectedUserNames: [],
        messages: new MessageLinkedList(),
      })

      console.log('a new user', user)
      const newUser = {
        connection: true,
        message: 'Connected Succesfully',
        userId,
        accessId,
        name: parsed.name,
        userIds: [],
      }

      socket.send(JSON.stringify(newUser))
    } else if (parsed.newConnection === false) {
      socket.send(
        JSON.stringify({
          connection: false,
          message: 'Failed to connect (Invalid request)',
        })
      )
    } else if (parsed.newConnection === undefined) {
      socket.send(
        JSON.stringify({
          connection: false,
          message: 'Failed to connect (Invalid request)',
        })
      )
    } else {
      socket.send(
        JSON.stringify({
          connection: false,
          message: 'Failed to connect (Invalid request)',
        })
      )
    }
  })

  socket.on('close', (code, buffer) => {
    console.log('the connection has been closed ', code, buffer)
  })
})

server.listen(port, () => {
  consola.success('Server is running')
  port_log(`Server is running at http://localhost:${port}`)
})
