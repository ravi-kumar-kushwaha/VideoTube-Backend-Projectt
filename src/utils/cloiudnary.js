import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import dotenv from 'dotenv';
dotenv.config();

// Configuration of cloudinary
cloudinary.config({ 
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
    api_key: process.env.CLOUDINARY_API_KEY, 
    api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
});
// Upload an image
const uploadOnCloudinary = async (localFilePath) =>{
    try {
        // console.log("cloudinary.config:",{ 
        //     cloud_name: process.env.CLOUDINARY_CLOUD_NAME, 
        //     api_key: process.env.CLOUDINARY_API_KEY, 
        //     api_secret: process.env.CLOUDINARY_API_SECRET // Click 'View API Keys' above to copy your API secret
        // });
        if(!localFilePath){
            return null
        }
       const response = await cloudinary.uploader.upload(localFilePath, {
            resource_type: 'auto',
        })
        console.log("file successfully uploaded to cloudinary. File src:", response.url);
        //once the file is uploaded, delete the file from our server
        fs.unlinkSync(localFilePath);
        return response
    } catch (error) {
        console.log("Error on cloudinary:", error);
        fs.unlinkSync(localFilePath);
        return null
    }
}
const detefromCloudinary = async (publicId) => {
    try {
        const result = await cloudinary.uploader.destroy(publicId);
        console.log("deleted from cloudinary:", result,{publicId:publicId});
        return result
    } catch (error) {
        console.log("error deleting from cloudinary:", error);
        return null;
    }
}
console.log(uploadOnCloudinary);
export {uploadOnCloudinary , detefromCloudinary}