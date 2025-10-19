import { Router, json } from "express";
import { predictLongevity } from "../services/predictLongevity";

const router = Router();
router.use(json());
router.post("/", (req, res) => {
  try {
    res.status(200).json(predictLongevity(req.body));
  } catch (e: any) {
    res.status(400).json({ error: String(e.message || e) });
  }
});
export default router;
