import express from 'express';
import { createBooking,getAllBookings,updateOneBooking } from "../controllers/bookingController";
import { protect } from "../middleware/authMidlleware";

const router  = express.Router();

router.post('/createBooking', protect(['Admin','Hosts','Renters']), createBooking);
router.put('/updateBooking/:id', protect(['Admin','Hosts']), updateOneBooking)

router.get('/getAllBookings', protect(['Admin','Hosts']), getAllBookings);

export default router