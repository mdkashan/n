import mongoose from 'mongoose'
import express from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import cors from 'cors'
import userModel from './models/userModel.js'
import foodModel from './models/foodModel.js'
import trackingModel from './models/trackingModel.js'
import verifyToken from './verifyToken.js'
import dotenv from 'dotenv'

dotenv.config()

mongoose.connect(process.env.DB_URL)
.then(()=> console.log("DB connection sucssfull"))
.catch((err)=> console.log(err))


const app = express();
app.use(express.json());
app.use(cors());
app.get("/", (req, res)=>{
    res.send("HOME PAGE")
})
// endpoint for registering user 
app.post("/register", (req,res)=>{
    
    let user = req.body;
    bcrypt.genSalt(10,(err,salt)=>{
        if(!err)
        {
            bcrypt.hash(user.password,salt,async (err,hpass)=>{
                if(!err)
                {
                    user.password=hpass;
                    try 
                    {
                        let doc = await userModel.create(user)
                        res.status(201).send({message:"User Registered"})
                    }
                    catch(err){
                        console.log(err);
                        res.status(500).send({message:"Some Problem"})
                    }
                }
            })
        }
    })  
})

// endpoint for login 
app.post("/login",async (req,res)=>{
    let userCred = req.body;
    try 
    {
        const user=await userModel.findOne({email:userCred.email});
        if(user!==null)
        {
            bcrypt.compare(userCred.password,user.password,(err,success)=>{
                if(success==true)
                {
                    jwt.sign({email:userCred.email}, process.env.SECRET_KEY, (err,token)=>{
                        if(!err)
                        {
                            res.send({message:"Login Success",token:token,userid:user._id,name:user.name});
                        }
                    })
                }
                else 
                {
                    res.status(403).send({message:"Incorrect password"})
                }
            })
        }
        else 
        {
            res.status(404).send({message:"User not found"})
        }
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:"Some Problem"})
    }
})

// endpoint to fetch all foods 

app.get("/foods",verifyToken,async(req,res)=>{

    try 
    {
        let foods = await foodModel.find();
        res.send(foods);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:"Some Problem while getting info"})
    }

})

// endpoint to search food by name 

app.get("/foods/:name",verifyToken,async (req,res)=>{

    try
    {
        let foods = await foodModel.find({name:{$regex:req.params.name,$options:'i'}})
        if(foods.length!==0)
        {
            res.send(foods);
        }
        else 
        {
            res.status(404).send({message:"Food Item Not Fund"})
        }
       
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:"Some Problem in getting the food"})
    }
})

// endpoint to track a food 

app.post("/track",verifyToken,async (req,res)=>{
    
    let trackData = req.body; 
    try 
    {
        let data = await trackingModel.create(trackData);
        console.log(data)
        res.status(201).send({message:"Food Added"});
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:"Some Problem in adding the food"})
    }
})


// endpoint to fetch all foods eaten by a person 

app.get("/track/:userid/:date",async (req,res)=>{

    let userid = req.params.userid;
    let date = new Date(req.params.date);
    let strDate = (date.getMonth()+1)+"/"+date.getDate()+"/"+date.getFullYear();
    try
    {
        let foods = await trackingModel.find({userId:userid,eatenDate:strDate}).populate('userId').populate('foodId')
        res.send(foods);
    }
    catch(err)
    {
        console.log(err);
        res.status(500).send({message:"Some Problem in getting the food"})
    }
})


const port = process.env.PORT;
app.listen(port,()=>{
    console.log(`Server is up and running on port  ${port}`);
})
