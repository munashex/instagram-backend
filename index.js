import express, { application } from 'express' 
import 'dotenv/config' 
import ConnectDB from './configs/db.js' 
import register from './routes/RegisterRoute.js' 
import user from './routes/UserRoute.js' 
import post from './routes/PostRoutes.js' 
import cors from 'cors'  


 const PORT = process.env.PORT || 3002
 ConnectDB()

const app = express()  

//middlewares

app.use(express.json())  
app.use(express.urlencoded({extended: true})) 
app.use(cors())

app.use('/api/user', register)  
app.use('/user', user) 
app.use('/post', post)

app.listen(PORT, () => console.log(`server is running on ${PORT}`))