require('dotenv').config()
const cors = require('cors')
const express = require('express')
const usersRoutes = require('./routes/users')
const authRoutes = require('./routes/auth')

const app = express()

app.use(cors())
app.use(express.json())
app.use('/api/users', usersRoutes)
app.use('/api/auth', authRoutes)

app.listen(procces.env.PORT || 5000, () => console.log('Server running'))