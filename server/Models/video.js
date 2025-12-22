import mongoose from 'mongoose'

const videoSchema = new mongoose.Schema({
    videotitle: {
        type: String,
        required: true,
    },
    filename: {
        type: String,
        required: true,
    },
    filetype: {
        type: String,
        required: true,
    },
    filepath: {
        type: String,
        required: true,
    },
    filesize: {
        type: String,
        required: true,
    },
    videochanel: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        default: "",
    },
    Like:{
        type:Number,
        default:0,
    },
    views:{
        type:Number,
        default:0,
    },
    uploader:{
        type:String, 
    },
    // Cloudinary fields
    cloudinaryPublicId: {
        type: String,
        default: null,
    },
    thumbnailUrl: {
        type: String,
        default: null,
    },
},{
    timestamps:true,
})
export default mongoose.model("videofiles",videoSchema)