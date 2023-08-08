import mongoose from 'mongoose' 


const VideoSchema = new mongoose.Schema({
    video: String, 
    public_id: String, 
    caption: String,
    user: {
        type: mongoose.Schema.Types.ObjectId, ref: "User"
    }, 
    createdAt: {
        type: Date, 
        default: Date.now
    }
})  


export const Video = mongoose.model("Videos", VideoSchema)