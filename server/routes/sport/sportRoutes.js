import express from "express";
import { checkSportName, createSport, getSports, getSportsByPage, updateSport } from "../../controllers/sport/sportController.js";


const router = express.Router();

router.get("/check-name-exist", checkSportName);
router.get("/paging", getSportsByPage);
router.get("/", getSports);
router.post("/", createSport);
router.put("/:id", updateSport);

export default router;