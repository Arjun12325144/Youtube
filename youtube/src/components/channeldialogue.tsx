import {useRouter} from 'next/router'
import {useState,useEffect,ChangeEvent,FormEvent} from 'react'
import axiosInstance from "@/lib/axiosinstance";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Button } from './ui/button';
import { useUser } from "@/lib/AuthContext";
const Channeldiadlogue = ({isopen,onclose,channeldata,mode}:any)=>{
    // const user:any = {
    //     id:"1",
    //     name:"john",
    //     email:"bnrnb",
    //     image:"#",
    
    // }
    const { user,login } = useUser();
    const router = useRouter();
    const [formData,setFormData] = useState({
        name:"",description:""
    })
    const [isSubmitting,setIsSubmitting] = useState(false);
    useEffect(()=>{
        if(channeldata && mode ==="edit"){
            setFormData({
                name:channeldata.name ||"",
                description:channeldata.description ||""
            });
        }
        else{
            setFormData({
                name:user?.name || "",
                description:"",
            })
        }
    },[channeldata]);
    const handleChange = (e:ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>{
        const {name,value} = e.target;
        setFormData((prev)=>({...prev,[name]:value}));
    }
    const handleSubmit = async (e:FormEvent)=>{

        e.preventDefault()
        const payload = {
                 channelname:formData.name,
                 description:formData.description,
               
                
              }; 
              const response = await axiosInstance.patch(`/user/update/${user._id}`, payload);
              login(response?.data)
              router.push(`/channel/${user._id}`)
              setFormData({
                name: "",
                description:"",
            })
            onclose()
    }
    return (
         <Dialog open={isopen} onOpenChange={onclose}>
            <DialogContent className="sm:max-w-md md:max-w-lg">
                <DialogHeader>
                    <DialogTitle>
                        {mode==="create"?"Create your channel":"Edit your channel"}
                    </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">
                            Channel Name
                        </Label>
                        <Input id ="name" name="name" value={formData.name} onChange={handleChange} />
                    </div>
                    <div>
                        <Label htmlFor="description">
                            Channel Description
                        </Label>
                        <Textarea placeholder="Tell viewers about your channel..." id="description" name="description" value={formData.description} onChange={handleChange} rows={4} />
                    </div>
                    <DialogFooter className="flex justify-between sm:justify-between">
                        <Button type="button" variant="outline" onClick={onclose}>
                            Cancel

                        </Button>
                        <Button type='submit' disabled={isSubmitting} > {isSubmitting?"Saving...":mode === "create" ? "Create channel":"Save Changes"}

                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>

         </Dialog>
    )
}
export default Channeldiadlogue;