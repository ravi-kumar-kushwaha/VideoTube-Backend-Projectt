import mongoose from "mongoose";
import apiError from "../utils/apiError.js";
const errorHandler = (err,req,res,next)=>{
    let error = err;
    if(!(err instanceof apiError)){
        const statusCode = error.statusCode || error instanceof mongoose.Error ? 400 : 500;
        const message = error.message || "Something went wrong";
        error = new apiError(statusCode, message, error?.errors||[], err.stack);
    }
   const response = {
    ...error,
    message: error.message,
    ...new apiError(process.env.NODE_ENV === "development" ? { stack: error.stack }:{})
   }
   return res.status(error.statusCode).json(response);
}
export {errorHandler}

// import mongoose from "mongoose";
// import ApiError from "../utils/apiError.js";

// const errorHandler = (err, req, res, next) => {
//   let error = err;
//   if (!(err instanceof ApiError)) {
//     const statusCode = error.statusCode || (error instanceof mongoose.Error ? 400 : 500);
//     const message = error.message || "Something went wrong";
//     error = new ApiError(statusCode, message, error?.errors || [], error.stack);
//   }
//   const response = {
//     ...error,
//     message: error.message,
//     ...(process.env.NODE_ENV === "development" ? { stack: error.stack } : {})
//   };
//   return res.status(error.statusCode).json(response);
// };

// export { errorHandler };