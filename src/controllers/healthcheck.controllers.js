import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js";
import asynchHandler from "../utils/asynchHandlers.js";

const healthcheck = asynchHandler(async(req,res)=>{
    return res
    .status(200)
    .json(new apiResponse(200,"ok","healthcheck passed"));
})

export {healthcheck}