import express from 'express';
import { getAcademyDetails, getAcademyDetailsById, filterAcademies, registerAcademy, createAcademyReview } from '../controllers/academyControllers.js';
import { verifyAccessToken } from '../middleware/authMiddleware.js';


const router = express.Router();

//For academy routes
router.get('/details', verifyAccessToken, getAcademyDetails);
//For getting the details of the academy by id
router.get('/details/:id', verifyAccessToken, getAcademyDetailsById);
//For filtering academies by city, rating, ageGroup
router.get('/filter', verifyAccessToken, filterAcademies);

//For registering a new academy and linking coaches
router.post('/register', verifyAccessToken, registerAcademy);

//For creating or updating a review for an academy
router.post('/:id/review', verifyAccessToken, createAcademyReview);



export default router;

