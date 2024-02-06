import {v2 as cloudinary} from 'cloudinary';
import fs from "fs"

cloudinary.config({ 
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || "danish-siddiqui", 
  api_key: process.env.CLOUDINARY_API_KEY || "591852473349489", 
  api_secret: process.env.CLOUDINARY_API_SECRET || "IEhHiMSchl7W3lBmMD0AaA4-xVY"
});

export const uploadFile = async (localFilePath) => {
    try{
        if(!localFilePath) return null;
        // Upload file on cloudinary
        const res = await cloudinary.uploader.upload(localFilePath, {
            resource_type: "auto",
            folder: '/master_backend'
        });
        // success
        fs.unlinkSync(localFilePath);
        return res
    }catch(error){
        // Remove the locally saved file if upload failed
        fs.unlinkSync(localFilePath)
        console.log(error);
        return null;
    }
}

export const deleteFile = async (public_id) => {
    try{
        if(!public_id) return null;

        const res = await cloudinary.uploader.destroy(public_id)
        return res;
    }catch(error){
        console.log(error)
        return null;
    }
}