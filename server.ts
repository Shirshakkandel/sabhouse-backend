import express from 'express'
const app = express()
import dotenv from 'dotenv'
dotenv.config()
import cors from 'cors'
import router from './router'
import DbConnect from './database'
import cookieParser from 'cookie-parser'

app.use(cookieParser())
app.use(cors({ credentials: true, origin: ['http://localhost:3000'] }))
app.use(express.json({ limit: '1mb' }))
app.use(router)

const PORT = process.env.PORT || 5500
DbConnect()

app.use('/storage', express.static('storage'))
app.get('/', (req, res) => {
  res.send('hello from express Js')
})
app.listen(PORT, () => console.log(`Server is listening on Port ${PORT}`))
