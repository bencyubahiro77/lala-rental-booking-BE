import express from 'express';
import { createProperty, getAllProperty, getOneProperty,updateOneProperty, deleteProperty} from "../controllers/propertyController";
import { protect } from "../middleware/authMidlleware";
import upload from "../config/multerConfig"

const router  = express.Router();

router.post('/createProperty', protect(['Admin','Hosts']), upload.single('propertyImage'), createProperty);
router.put('/updateProperty/:id', protect(['Admin','Hosts']), upload.single('propertyImage'), updateOneProperty)
router.delete('/deleteProperty/:id', protect(['Admin','Hosts']), deleteProperty);

router.get('/getAllProperties', getAllProperty);
router.get('/getOneProperty/:id', getOneProperty);

export default router