import express from 'express';
import jwt from 'jsonwebtoken';

const router = express.Router();

router.post("/login", async(req, res) => {
    try{
        const {email} = req.body;

        if(!email){
            return res.status(400).json(
                {
                    status: "error",
                    message: "enter your email",
                });
        }

        const userSessionData = {
            userID: "user_id",
            email,
            role: "user",
        };

        const token = jwt.sign(userSessionData, process.env.jwt_pw,{
            expiresIn: "1h",
        });

        return res.json(
            {
                status: "success",
                message: "logged in",
                token,
            });
    }catch(err){
        return res.status(500).json(
            {
                status: "error",
                message: "login failed",
            });
    }
});

export default router;
