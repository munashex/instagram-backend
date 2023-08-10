import mongoose from 'mongoose' 


const MediaSchema = new mongoose.Schema({ 
   bio: String, 
   image: String, 
   public_id: String, 
   user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
   }, 
   username : {
      type: mongoose.Schema.Types.String, 
      ref: "User"
   }, 
   name: {
      type: mongoose.Schema.Types.String, 
      ref: "User"
   }
}) 

const Media = mongoose.model("Media", MediaSchema) 
export default Media