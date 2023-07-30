import express from 'express' 
import dotenv from 'dotenv' 
import cors from 'cors'  
const PORT = process.env.PORT || 3002 


dotenv.config()

app.use(express.json())  



app.listen(PORT, () => console.log(`server is running on ${PORT}`))