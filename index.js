import express from 'express' 


 

const app = express()


app.use(express.json())  



app.listen(PORT, () => console.log(`server is running on ${PORT}`))