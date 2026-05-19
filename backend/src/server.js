import express from 'express';
import cors from 'cors';
import { toNodeHandler } from 'better-auth/node';
import { auth } from './lib/auth.js';
import playerRoutes from './routes/playerRoutes.js';
import academyRoutes from './routes/academyRoutes.js';
import tournamentRoutes from './routes/tournamentRoutes.js';
import coachRoutes from './routes/coachRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import gamificationRoutes from './routes/gamificationRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import authCustomRoutes from './routes/authCustomRoutes.js';
import { startRankingJob } from './lib/rankingJob.js';
import { startBracketWorker } from './lib/bracketQueue.js';
import cookieParser from 'cookie-parser';
import { urlencoded } from 'express';
import { requireCsrfHeader } from './middleware/csrfMiddleware.js';
const REQUIRED_ENV = [
  'BETTER_AUTH_SECRET',
  'DATABASE_URL',
];
const missing = REQUIRED_ENV.filter(k => !process.env[k]);
if (missing.length) {
  console.error(`FATAL: Missing required env vars: ${missing.join(', ')}`);
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 4000;

app.set('trust proxy', 1);

// CORS — allow frontend origin with credentials (cookies)
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
    credentials: true,
}));

// better-auth catch-all — MUST be before express.json()
app.all("/api/auth/*splat", toNodeHandler(auth));

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
app.use(express.json({limit: '15mb'}));
//For parsing cookies
app.use(cookieParser());
//For URL limit for url encoder
app.use(urlencoded({limit: '10mb', extended: true }));

// CSRF protection for all mutating requests (webhook + better-auth excluded)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/v1/payment/webhook')) return next();
  if (req.path.startsWith('/api/auth')) return next();
  return requireCsrfHeader(req, res, next);
});
//Custom auth endpoints not covered by better-auth
app.use('/api/v1/auth', authCustomRoutes);
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
