import { Router } from 'express';

import { isAuth } from '../middleware/is-auth';

import { getUserDetail } from '../controller/user.controller';

const router = Router();

router.get('/current', [isAuth], getUserDetail);

const userRouter = router;
export default userRouter;
