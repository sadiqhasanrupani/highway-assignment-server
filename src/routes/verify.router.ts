import { Router } from "express";
const router = Router();

import { isAuth } from "../middleware/is-auth";
import { verifyTokenHandler } from "../controller/verify";

router.post("/token", [isAuth], verifyTokenHandler);

const verifyRoute = router;
export default verifyRoute;
