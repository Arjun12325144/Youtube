// import users from '../Models/Auth.js';
// import mongoose from 'mongoose';
// export const login = async(req,res)=>{
//     const {email,name,image} = req.body;
//     try{
//         const existingUser = await users.findOne({email})
//         if(!existingUser){
//             try{
//                 const newuser = await users.create({email,name,image})
//                 res.status(200).json({message:"user created successfully",newuser});
//             }catch(err){
//                 console.log(err)
//                 return;
//             }
//         }else{
//             res.status(200).json({message:"user already exists",existingUser})
//         }
//     }catch(err){
//         res.status(500).json({message:"something went wrong",err})
//         return;
//         // console.log(err)
//     }
// }

// export const updateprofile = async(req,res)=>{
//     const {id:_id}=  req.params;
//     const {channelname,description} = req.body;
//     if(!mongoose.Types.ObjectId.isValid(_id)){
//         return res.status(500).json({message:"user unavailable..."})
//     }
//     try{
//         const updateduser = await users.findByIdAndUpdate(_id,{$set:{channelname,description}},{new:true})
//         return res.status(200).json({message:"user updated successfully",updateduser})
//     }catch(err){
//         console.error(err);
//         res.status(500).json({message:"something went wrong",err})
//     }

// }
import mongoose from "mongoose";
import users from "../Models/Auth.js";

export const login = async (req, res) => {
  const { email, name, image } = req.body;

  try {
    const existingUser = await users.findOne({ email });

    if (!existingUser) {
      const newUser = await users.create({ email, name, image });
      return res.status(201).json({ result: newUser });
    } else {
      return res.status(200).json({ result: existingUser });
    }
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};
export const updateprofile = async (req, res) => {
  const { id: _id } = req.params;
  const { channelname, description } = req.body;
  if (!mongoose.Types.ObjectId.isValid(_id)) {
    return res.status(500).json({ message: "User unavailable..." });
  }
  try {
    const updatedata = await users.findByIdAndUpdate(
      _id,
      {
        $set: {
          channelname: channelname,
          description: description,
        },
      },
      { new: true }
    );
    return res.status(201).json(updatedata);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export const getUserById = async (req, res) => {
  const { id } = req.params;
  console.log("getUserById called with id:", id);
  
  // Check if id is a valid MongoDB ObjectId
  const isValidId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
  if (!isValidId) {
    console.warn("Invalid user ID format:", id);
    return res.status(400).json({ message: "Invalid user ID format" });
  }
  
  try {
    const user = await users.findById(id).lean();
    console.log("User found:", user ? "yes" : "no");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Get user error:", error.message || error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};