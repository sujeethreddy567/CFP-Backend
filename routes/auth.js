const router = require('express').Router();
const User = require('../model/User')
const {registerValidation, loginValidation}= require('../validation');
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
//Register
router.post('/register',async (req,res)=>{
    //Data Validation
    const {error} = registerValidation(req.body)
    if(error) return res.send({"message" : error.details[0].message,"created":false})

    //Check for pre-existing emails emails
    const emailExist = await User.findOne({email:req.body.email});
    if(emailExist) return res.send({"message" : "Email already exists","created":false});

    // Hashing Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(req.body.password,salt);

    //Create User
    const user = new User({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword
    })
    try{
        const savedUser = await user.save();
        console.log("User Registered : ",registerValidation(req.body).value)
        await res.send({"message" : "User Registered","created":true});
    }catch(err){
        console.log("Error : ",error)
        res.send(err)
    }
})
//LOGIN
router.post('/login',async (req,res)=>{
    //Data Validation
    const {error} = loginValidation(req.body)
    if(error) return res.send({"message" : error.details[0].message,"token": null})
    
    //Check for pre-existing emails emails
    const user = await User.findOne({email:req.body.email});
    if(!user) return res.send({"message" : "Email or Password is wrong","token": null});
    //Password is  correct
    const validPass = await bcrypt.compare(req.body.password,user.password);
    if(!validPass) return res.send({"message" : "Email or Password is wrong","token": null});
    
    //create and assign token
    const token = jwt.sign({_id:user._id},process.env.TOKEN_SECRET)
    res.header('auth-token',token).status(200).send({"message" : 'Logged in!!',"token": token});
})
module.exports = router;