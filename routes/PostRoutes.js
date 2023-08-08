import express from 'express' 
const post = express.Router()
import ImagePost from "../models/ImagesPost.js";  
import {v2 as cloudinary} from 'cloudinary' 
import multer from 'multer' 
import fs from 'fs'  
import isAuth from '../middlewares/authUser.js';
import { Video } from '../models/VideosPost.js';


cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
}) 

const upload = multer({dest: 'uploads/'}) 

const uploadVideo = multer({
    storage: multer.diskStorage({}),
    fileFilter: (req, file, cb) => {
      if (file.mimetype.startsWith('video')) {
        cb(null, true);
      } else {
        cb(new Error('Not a valid video file'));
      }
    },
  });
  
//images Routes starts @ 29 line of code to 98 
post.post('/image', isAuth, upload.single("image"), async(req, res) => {
const {caption} = req.body   

if(!req.file) {
    res.status(400).json({message: 'please provide image'}) 
    return
}

const results = await cloudinary.uploader.upload(req.file.path, {
    folder: "images", 
    allowed_formats: ['png', 'jpg', 'jpeg'], 
    resource_type: "image", 
    transformation: [{width: 500, height: 500, crop: 'scale'}]
}) 
 
const newImage = new ImagePost({
    caption, 
    image: results.secure_url, 
    public_id: results.public_id, 
    user: req.user._id
})

await newImage.save() 
fs.unlinkSync(req.file.path)
res.status(201).json({images: newImage})

})  

post.delete('/image/delete/:id', isAuth,  async(req, res) => {
    try{
    const imageId = req.params.id
    const image = await ImagePost.findById(imageId)  

    if(!image) {
        return res.status(400).json({message: "no image found"}) 
        return
    }
    await cloudinary.uploader.destroy(image.public_id) 
    await image.deleteOne() 
  res.status(200).json({message: 'image deleted'})
    }catch(err) {
        console.log(err)
    }
})

post.get("/images", isAuth, async(req, res) => {

    const findPost = await ImagePost.find({user: req.user._id}) 
    if(!findPost){ 
        res.status(400).message("not post found")
        return 
    }
     res.status(200).json({images: findPost})
}) 

post.get('/image/:imageId', isAuth,  async(req, res) => {
try{
    const imageId = req.params.imageId
    const image = await ImagePost.findById(imageId) 

    if(!image) {
        res.status(400).json({message: 'image not found'}) 
        return 
    } 
    res.status(200).json({image: image}) 
}catch(err) {
    console.log(err.message)
}
})


//Videos routes below 

post.post('/video', uploadVideo.single("video"), isAuth, async(req, res) => {
try {
if(!req.file) {
return res.status(400).json({message: "Please provide a video"})
}

const {caption} = req.body

const results = await cloudinary.uploader.upload(req.file.buffer)  

const newVideo = new Video({
    video: results.secure_url, 
    public_id: results.public_id,
    caption, 
    user: req.user._id
})

const savedVideo = await newVideo.save() 
res.status(201).json({video: savedVideo})
}catch(err) {
    console.log(err)
}
})
export default post
