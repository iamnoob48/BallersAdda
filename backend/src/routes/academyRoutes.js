import express from 'express';
import { getAcademyDetails, getAcademyDetailsById, filterAcademies } from '../controllers/academyControllers.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';


const router = express.Router();

//For academy routes
router.get('/details', verifyAccessToken, getAcademyDetails);
//For getting the details of the academy by id
router.get('/details/:id', verifyAccessToken, getAcademyDetailsById);
//For filtering academies by city, rating, ageGroup
router.get('/filter', verifyAccessToken, filterAcademies);



export default router;

