// const mongoose = require('mongoose');
import mongoose from 'mongoose'
const foodSchema = mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    imageUrl:{
        type:String,
        required:true
    },
    calories:{
        type:Number,
        required:true,
    },
    protein:{
        type:Number,
        required:true,
    },
    carbohydrates:{
        type:Number,
        required:true,
    },
    fat:{
        type:Number,
        required:true,
    },
    fiber:{
        type:Number,
        required:true,
    }

},{timestamps:true})


const foodModel = mongoose.model("foods",foodSchema)
export default foodModel;
// module.exports = foodModel;