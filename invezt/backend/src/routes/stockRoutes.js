import express from 'express';
const router = express.Router();

router.get('/info', (req,res) => {
    res.json({status:"ok", message: "stock route"});
});

export default router;


