import mongoose from 'mongoose' 


const ImagePosts = new mongoose.Schema({
 caption: String, 
  image: String, 
  public_id: String, 
  user: {
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User"
   }, 
  username: {
  type: mongoose.Schema.Types.String, 
  ref: "User"
  },
   createdAt: {
    type: Date,
    default: Date.now,
}, 
}) 


const ImagePost = mongoose.model("images", ImagePosts) 
export default  ImagePost