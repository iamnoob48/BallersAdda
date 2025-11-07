import express from 'express';
import authRoutes from './routes/authRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import './config/passportConfig.js';
import cookieParser from 'cookie-parser';


const app = express();
const PORT = process.env.PORT || 3000;
//For parsing application/json
app.use(express.json());
//For parsing cookies
app.use(cookieParser());

//For auth endpoints
app.use('/api/v1/auth', authRoutes)
//For player detailing routes
app.use('/api/v1/player',playerRoutes)

app.get('/', (req, res) => {
    res.send('Welcome to the Youth Football Website Backend!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
})
