import mongoose from "mongoose"

const ConnectDb = async()=>{
    try {
        const Connection = await mongoose.connect(`${process.env.MONGO_URI}`);
        console.log(`Database Connected Successfully! Database Host:${Connection.connection.host}`);
    } catch (error) {
        console.log("Something Going Wrong With Database!");
        console.error(error);
        process.exit(1);
    }
}
export default ConnectDb

