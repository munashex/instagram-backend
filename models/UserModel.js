import mongoose from 'mongoose' 
const {Schema} = mongoose  


const UserSchama = new Schema({
  email: {
    type: String, 
    required: true, 
    unique: true
  },
  name: {
  type: String, 
  required: true, 
  },
  password: {
  type: String, 
  required: true, 
  }, 
  username: {
  type: String, 
  required: true, 
  unique: true
  }
}, {timestamps: true})  

export const User = mongoose.model("User", UserSchama)
