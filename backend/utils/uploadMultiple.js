import {v2 as cloudinary } from "cloudinary"
import asynchandler from "express-async-handler"
import dotenv from "dotenv"
dotenv.config()

cloudinary.config({
    cloud_name:process.env.CLOUD_NAME,
    api_key:process.env.API_KEY,
    api_secret:process.env.API_SECRET
})
const uploadMultiple = asynchandler(async(req,res,next)=>{
    try{
        if(!req.files || req.files.length === 0){
            return res.status(400).json({message:"No files attached"})
        }
        const uploadePromise = req.files.map((image)=>cloudinary.uploader.upload(image.path,{resource_type:'auto',folder:"recipes"}))
            const results = await Promise.all(uploadePromise)
            req.images = results.map((file)=>file.secure_url)
        next()

    }catch(error){
        return res.status(500).json(error.message)
    }
})
export default uploadMultiple