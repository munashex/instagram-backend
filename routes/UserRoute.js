import express from 'express' 
const user = express.Router() 
import isAuth from '../middlewares/authUser.js'  
import {User} from '../models/UserModel.js'  
import Media from '../models/userMedia.js' 
import {v2 as cloudinary} from 'cloudinary'
import multer from 'multer' 
import fs from 'fs' 
import ImagePost from '../models/ImagesPost.js'

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME, 
    api_key: process.env.API_KEY, 
    api_secret: process.env.API_SECRET
}) 

const upload = multer({dest: 'uploads/'})

// starting from here to line 98 its about crud operation for single user
user.get('/profile/:userId', isAuth, async(req, res) => { 
 try {
    const userId = req.params.userId 

 const user = await Media.findOne({user: userId}) 

 if(!user) {
    res.status(400).json({message: "user not found"}) 
    return
 } 

 res.status(200).json({user: user})
 }catch(err) {
    console.log(err)
 }
})



user.post('/profile', upload.single("image"), isAuth,  async(req, res) => { 
 try {
    const {bio} = req.body 

    if(!req.file) {
        res.status(400).json({message: 'Please provide image'})
    }
       
        const results = await cloudinary.uploader.upload(req.file.path, {
            folder: 'profile_pics', 
            transformation: [{width: 200, height: 200, crop: 'fill'}], 
            allowed_formats: ["jpeg", "png", "jpeg"], 
            resource_type: 'image'
        }) 
    
        const newMedia = new Media({
            image: results.secure_url, 
            public_id: results.public_id, 
            bio,
            user: req.user._id, 
            username: req.user.username, 
            name: req.user.name
        }) 
    
        const image = await newMedia.save()  
        fs.unlinkSync(req.file.path)
        res.status(201).json({image: image})
 }catch(err) {
    console.log(err.message)
 }
})

user.put('/editprofile', upload.single("image"), isAuth, async (req, res) => {
try{
     
const userId = req.user._id 
const {bio} = req.body 

const user = await Media.findOne({user: userId}) 

if(!user) { 
    res.status(400).json({message: 'user not found'})
    return
} 

user.bio = bio
await cloudinary.uploader.destroy(user.public_id) 

if(!req.file) {
    res.status(400).send({message: "please provide image"}) 
    return
}
const results = await cloudinary.uploader.upload(req.file.path, {
    folder: 'profile_pics', 
    transformation: [{width: 200, height: 200, crop: 'fill'}], 
    allowed_formats: ["jpeg", "png", "jpeg"], 
    resource_type: 'image'
})

user.image = results.secure_url 
user.public_id = results.public_id 

const savedProfile = await user.save() 
res.status(200).json({profile: savedProfile}) 
fs.unlinkSync(req.file.path)

}catch(err) {
    console.log(err)
}
})


//endpoint for all users
user.get('/users', async(req, res) => {
    try {
    const users = await ImagePost.find() 
    
    if(!users) { 
        res.status(400).json({message: 'no users'})
        return
    }  
    res.status(200).json({users: users}) 
    }catch(err) { 
   res.status(500).json({message: err.message})
  console.log(err)
    }
})

export default user





