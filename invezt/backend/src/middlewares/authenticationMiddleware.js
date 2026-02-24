import jwt from "jsonwebtoken";

const authenticationMiddleware = (req,res,next) => {
    try{
        const authenticationHeader = req.headers.authorization || "";
        const token = authenticationHeader.startsWith("Bearer ")
        ? authenticationHeader.slice(7).trim()
        : "";

        if (!token){
            return res.status(401).json(
                {
                    status: "error",
                    message: "missing token"
                });
       }
        
       const userData = jwt.verify(token, process.env.jwt_key);
        req.user = userData;

        return next();

    }catch(error){
        return res.status(401).json(
            {
                status: "error",
                message: "invalid or expired token",
            });
        
    }
};

export default authenticationMiddleware;
