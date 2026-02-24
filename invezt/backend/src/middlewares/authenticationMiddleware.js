import jwt from "jsonwebtoken";

const authenticationMiddleware = (req,res,next) => {
    try{
        const authenticationHeader = req.headers.authorization || "";
        const token = authenticationHeader.startsWith("Bearer ")
        ? authenticationHeader.slice(7).trim()
        : " ";

        if (!token){
            return res.status(401).json(
                {
                    status: "error",
                    message: "unauthorized access"
                });
    }

    catch(error){
        
    };
};

export default authMiddleware;
