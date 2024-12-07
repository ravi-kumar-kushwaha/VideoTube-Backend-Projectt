import {app} from "./app.js";
import dotenv from "dotenv";
import ConnectDb from "./db/db.js";
dotenv.config();



const port = process.env.PORT || 3000;
//database connection
ConnectDb()
//routes
app.post("/",(req,res)=>{
   res.send("Welcome To VideoTube!")
})
app.listen(port,()=>{
    console.log(`server is running at port http://localhost:${port}`)
})

