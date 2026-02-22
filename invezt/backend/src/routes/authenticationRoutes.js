import express from 'express';
const router = express.Router();

router.post('/login', (req, res) => {
    res.json({status:"success", message: "authentication route" });
});

export default router;
