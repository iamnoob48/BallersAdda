import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import academyRoutes from './routes/academyRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import './config/passportConfig.js';
import cookieParser from 'cookie-parser';
import { urlencoded } from 'express';


const app = express();
const PORT = process.env.PORT || 3000;

// CORS — allow frontend origin with credentials (cookies)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

//For parsing application/json
app.use(express.json({limit: '50mb'}));
//For parsing cookies
app.use(cookieParser());
//For URL limit for url encoder
app.use(urlencoded({limit: '50mb', extended: true }));

//For auth endpoints
app.use('/api/v1/auth', authRoutes);
//For player detailing routes
app.use('/api/v1/player', playerRoutes);
//For academy routes
app.use('/api/v1/academy', academyRoutes);
//For tournament routes
app.use('/api/v1/tournament', tournamentRoutes);
//For coach routes
app.use('/api/v1/coach', coachRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Youth Football Website Backend!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
