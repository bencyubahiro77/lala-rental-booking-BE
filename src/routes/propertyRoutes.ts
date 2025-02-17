import express from 'express';
import { createProperty, getAllProperty, getOneProperty,updateOneProperty, deleteProperty} from "../controllers/propertyController";
import { protect } from "../middleware/authMidlleware";

const router  = express.Router();

router.post('/createProperty', protect(['admin','Hosts']), createProperty);
router.put('/updateProperty/:id', protect(['admin','Hosts']), updateOneProperty)
router.delete('/deleteProperty/:id', protect(['admin','Hosts']), deleteProperty);

router.get('/getAllProperties', getAllProperty);
router.get('/getOneProperty/:id', getOneProperty);

export default router