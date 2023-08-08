import express from 'express' 
import { User } from '../models/UserModel.js'  
import bcrypt from 'bcrypt' 
import jwt from 'jsonwebtoken'  
import isAuth from '../middlewares/authUser.js'




const router = express.Router() 

const generateToken = (user) => {
    return jwt.sign({_id: user._id, username: user.username}, process.env.JWT_SECRET, {expiresIn: '90d'} )
}

router.post('/register', async(req, res) => {
    try {
    const {name, email, password, username} = req.body  
   
    const user = await User.findOne({email})  
    const user_name = await User.findOne({username})
    
    if(user) {
        res.status(400).json({message: 'A user with email exists'}) 
        return
    }

    if(user_name) {
        res.status(400).json({message: 'A user with username exists'}) 
        return
    } 

    const newUser = new User({
        name, 
        email, 
        password: bcrypt.hashSync(password, 10),
        username
    })
    await newUser.save() 
    return res.status(201).json({token: generateToken(newUser)})
    } catch(err) {
        res.status(500).json('something went wrong')
    }
}) 


router.post('/login', async(req, res) => {
   const {email, password} = req.body;  

   const user = await User.findOne({ email });

  if (!user) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Compare the hashed password in the database with the provided password
  const isPasswordValid = await bcrypt.compare(password, user.password);

  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials' });
  } 

  res.json({user: user, token: generateToken(user)})

}) 




export default router