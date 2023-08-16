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

user.get('/username/:username',  async (req, res) => {
 try { 
 const user = await Media.findOne({username: req.params.username}) 

 if(!user) {
    return res.status(400).json({message: 'User not found'}) 
    return
 }
 
 res.status(200).json({user})
 }catch(err) {
    console.log(err)
 }
})

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

user.get("/userprofile/:id", async(req, res) => {
    try {
    const media = await Media.findOne({user: req.params.id})  
    const user = await User.findById(req.params.id) 
    const images = await ImagePost.find({user: req.params.id})

    if(!media || !user  ) {
        res.status(200).json({message: 'user info not found'})
    } 

    res.status(200).json({media, user, images})
    }catch(err) {
    console.log(err.message) 
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
user.get('/users', async (req, res) => {
    try {
      const users = await ImagePost.find();
  
      if (!users) {
        res.status(400).json({ message: 'No users found' });
        return;
      }
  
      res.status(200).json({ users: users });
    } catch (err) {
      res.status(500).json({ message: err.message });
      console.log(err);
    }
  });
  


//endpoints for following someone 
user.post('/follow/:id', isAuth,  async(req, res) => {
  try {
    const currentUser = await User.findById(req.user._id) 
    const userToFollow = await User.findById(req.params.id)  
  
    

    if(!currentUser || !userToFollow) {
        res.status(404).json({message: "User not found"}) 
        return
    } 

    if(currentUser.following.includes(userToFollow._id)) {
        res.status(400).json({message: "you follow this user"}) 
        return
    }

    currentUser.following.push(userToFollow) 
    userToFollow.followers.push(currentUser) 
    await userToFollow.save() 

    const results = await currentUser.save() 
    res.status(201).json(results)
  }catch(err) {
    console.log(err.message) 
    res.status(500).json({message: err})
  }
})


user.post('/unfollow/:id', isAuth, async(req, res) => {
try {
 const currentUser = await User.findById(req.user._id) 
 const userToUnFollow = await User.findById(req.params.id) 

 if(!currentUser || !userToUnFollow) {
    res.status(404).json({message: "User not found"}) 
    return
 } 



if(!currentUser.following.includes(userToUnFollow._id)) {
    res.status(404).json({message: "you dont follow this user"}) 
    return
}

  currentUser.following.pull(userToUnFollow) 
  userToUnFollow.followers.pull(currentUser) 
  userToUnFollow.save() 
  const results = await currentUser.save() 

 res.status(200).json(results)
}catch(err) {
    console.log(err.message) 
    res.status(400).json(err.message)
}
})


//endpoint to get user following 
user.get('/following/:userId', isAuth,  async(req, res) => {
    try {
     const userId = req.params.userId 
     const user = await User.findById(userId) 
     
     if(!user) {
        res.status(404).json({message: 'user not found'}) 
        return
     } 
     
     
    const users = await Media.find({user: user.following})  
    if(!users) {
        res.status(400).json({message: 'you dont follow any user'}) 
        return
    }
    res.status(200).json(users)
    }catch(err) { 
        console.log(err)
    }
})

user.get('/followers/:userId', isAuth,  async(req, res) => {
    try {
     const userId = req.params.userId 
     const user = await User.findById(userId) 
     
     if(!user) {
        res.status(404).json({message: 'user not found'}) 
        return
     } 
     
     
    const users = await Media.find({user: user.followers})  
    if(!users) {
        res.status(400).json({message: 'you dont have followers'}) 
        return
    }
    res.status(200).json(users)
    }catch(err) { 
        console.log(err)
    }
})

//routes for like and unlike image
user.post('/like/:imageId', isAuth, async(req, res) => {
    try {
    const user = await User.findById(req.user._id)  
    const imageId = await ImagePost.findById(req.params.imageId)
    if(!user) { 
        res.status(404).json({message: "User not found"})
        return
    }

    if(!imageId) {
        res.status(404).json({message: "Image not found"}) 
        return
    } 

    if(imageId.likes.includes(user._id)) {
        res.status(400).json({message: "you liked this image"}) 
        return
    }

    imageId.likes.push(user._id) 
    const results = await imageId.save() 
    res.status(200).json({results})
    }catch(err) { 
    res.status(500).json(err.message)
    console.log(err)
    }
})

user.post('/unlike/:imageId', isAuth, async(req, res) => {
    try {
   const imageId = await ImagePost.findById(req.params.imageId) 
   const user = await User.findById(req.user._id) 

   if(!user) { 
    res.status(404).json({message: "User not found"})
    return
   }


  if(!imageId) {
    res.status(404).json({message: "Image not found"}) 
    return
  } 

     imageId.likes.pull(user._id) 
    const results = await imageId.save() 
    res.status(200).json({results})
   
    }catch(err) {
        console.log(err.message) 
        res.status(500).json(err.message)
    }
})

//endpoints for comments 
user.post("/comment/:imageId", isAuth, async(req, res) => {
 try {
const {comment} = req.body
 const currentUser = await User.findById(req.user._id) 
 const imageId = await ImagePost.findById(req.params.imageId) 

 if(!currentUser) {
    res.status(400).json({message: 'user not found'}) 
    return
 }
 
 if(!imageId) {
    res.status(400).json({message: 'image not found'}) 
    return
 }

 imageId.comments.push({comment: comment, user: req.user.username}) 
 const results = await imageId.save() 
 res.status(201).json({comments: results})

 }catch(err) {
    console.log(err) 
    res.status(500).json(err.message)
 }
})


//endpoint to get single image comments byId 
user.get("/comments/:imageId", async (req, res) => {
    try {
     const imageId = await ImagePost.findById(req.params.imageId) 

     if(!imageId) {
      res.status(400).json({message: 'image not found'}) 
      return
     }

     res.status(200).json(imageId)
    }catch(err) {
        console.log(err) 
        res.status(500).json(err.message)
    }
})

export default user





