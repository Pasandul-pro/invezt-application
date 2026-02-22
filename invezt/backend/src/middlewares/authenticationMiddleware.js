const authMiddleware = (req,res, next) => {
    console.log(`[${new Date().toISOString()}] authentication middleware triggered`)

    try{
        next();
    }

    catch(error){
        return res.status(401).json(
            {
                status: "error",
                message: "unauthorized access"
            }
        )
    };
};

export default authMiddleware;
