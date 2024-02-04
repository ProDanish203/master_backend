// export const asyncHandler = (fn) = async (req, res, next) => {
//     try{
//         await fn(req, res, next);
//     }catch(err){
//         return res.status(err.code || 500)
//         .json({
//             success: false,
//             message: err.message
//         });
//     }
// }


// Promise approach
export const asyncHandler = (requestHandler) => {
    return (req, res, next) => {
        Promise.resolve(requestHandler(req, res, next))
        .catch((err) => next(err))
    }
}