import express from 'express';
import cors from 'cors';
import authRoutes from './routes/authRoutes.js';
import playerRoutes from './routes/playerRoutes.js';
import academyRoutes from './routes/academyRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import { startRankingJob } from './lib/rankingJob.js';
import { startBracketWorker } from './lib/bracketQueue.js';
import './config/passportConfig.js';
import cookieParser from 'cookie-parser';
import { urlencoded } from 'express';
import { requireCsrfHeader } from './middleware/csrfMiddleware.js';
const REQUIRED_ENV = [
  'ACCESS_TOKEN_JWT_SECRET',
  'REFRESH_TOKEN_JWT_SECRET',
  'DATABASE_URL',
];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`FATAL: Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}
const WEAK_SECRETS = ['my_secret_key', 'my_refresh_secret_key', 'secret', 'password'];
if (WEAK_SECRETS.includes(process.env.ACCESS_TOKEN_JWT_SECRET) || WEAK_SECRETS.includes(process.env.REFRESH_TOKEN_JWT_SECRET)) {
  console.error('FATAL: JWT secrets are trivially guessable. Generate strong random secrets before running in production.');
  if (process.env.NODE_ENV === 'production') process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

// CORS — allow frontend origin with credentials (cookies)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// Capture raw body for webhook signature verification
app.use('/api/v1/payment/webhook', express.raw({ type: 'application/json' }), (req, res, next) => {
  req.rawBody = req.body;
  try {
    req.body = JSON.parse(req.body);
  } catch {
    return res.status(400).json({ message: 'Invalid JSON in webhook body' });
  }
  next();
});

//For parsing application/json
app.use(express.json({limit: '10mb'}));
//For parsing cookies
app.use(cookieParser());
//For URL limit for url encoder
app.use(urlencoded({limit: '10mb', extended: true }));

// CSRF protection for all mutating requests (webhook excluded — uses signature verification)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/payment/webhook')) return next();
  return requireCsrfHeader(req, res, next);
});

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
//For leaderboard routes
app.use('/api/v1/leaderboard', leaderboardRoutes);
//For gamification routes
app.use('/api/v1/player', gamificationRoutes);
//For payment routes
app.use('/api/v1/payment', paymentRoutes);

app.get('/', (req, res) => {
    res.send('Welcome to the Youth Football Website Backend!');
})

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    startRankingJob();
    startBracketWorker();
})
