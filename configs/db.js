import mongoose from 'mongoose' 

 const  ConnectDB = async () => {
    try {
     mongoose.connect(process.env.MONGO_URI)
        console.log('connected to MONGODB') 
    }catch(err){ 
        console.log(err)
        process.exit(1) 
    }
}  

export default ConnectDB

