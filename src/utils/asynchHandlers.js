const asynchHandler = (requestHandler)=>{
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next)).catch((error)=>{
            next(error);
        });
    }
}
export default asynchHandler

//another way to write ashynchHandler
// const asynchHandlers = (fn) => (req, res, next) => {
//     Promise.resolve(fn(req, res, next)).catch(next);

//   };
//   export default asynchHandlers
