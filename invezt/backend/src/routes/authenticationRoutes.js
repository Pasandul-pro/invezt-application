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

        return res.json(
            {
                status: "error",
                message: "logged in",
                token,
            });

        
    res.json({status:"success", message: "authentication route" });
});

export default router;
