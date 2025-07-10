import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { OAuth2Client } from 'google-auth-library';
import jwt from 'jsonwebtoken';
import mongoose from 'mongoose';
import User from './User';
import multer from 'multer';
import path from 'path';
import JourneyHistory from './JourneyHistory';
import { Types } from 'mongoose';

dotenv.config();
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI);
const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || '469505743174-4t6tfljfm36kc3rdsbuipjfdcpfh171u.apps.googleusercontent.com';
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';
const oAuth2Client = new OAuth2Client(GOOGLE_CLIENT_ID);

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI!, { useNewUrlParser: true, useUnifiedTopology: true } as any)
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// Test endpoint
app.get('/api/test', (req: Request, res: Response) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

// Helper: Haversine distance
function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (x: number) => (x * Math.PI) / 180;
  const R = 6371; // km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Calculate total distance of a route
function calculateRouteDistance(route: any[]): number {
  let totalDistance = 0;
  for (let i = 0; i < route.length - 1; i++) {
    totalDistance += haversine(route[i].lat, route[i].lng, route[i + 1].lat, route[i + 1].lng);
  }
  return totalDistance;
}

// Nearest Neighbor TSP
function nearestNeighbor(start: any, destinations: any[]) {
  const startTime = performance.now();
  const unvisited = [...destinations];
  const route = [start];
  let current = start;
  let totalDistance = 0;
  
  while (unvisited.length > 0) {
    let nearestIdx = 0;
    let nearestDist = haversine(current.lat, current.lng, unvisited[0].lat, unvisited[0].lng);
    for (let i = 1; i < unvisited.length; i++) {
      const dist = haversine(current.lat, current.lng, unvisited[i].lat, unvisited[i].lng);
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }
    totalDistance += nearestDist;
    current = unvisited.splice(nearestIdx, 1)[0];
    route.push(current);
  }
  
  const endTime = performance.now();
  return { 
    route, 
    totalDistance: Number(totalDistance.toFixed(2)),
    executionTime: Number((endTime - startTime).toFixed(2))
  };
}

// 2-opt algorithm for route improvement
function twoOpt(route: any[]) {
  const startTime = performance.now();
  let improved = true;
  let bestDistance = calculateRouteDistance(route);
  let bestRoute = [...route];
  
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 2; i++) {
      for (let j = i + 1; j < route.length; j++) {
        if (j - i === 1) continue;
        
        const newRoute = [
          ...route.slice(0, i),
          ...route.slice(i, j).reverse(),
          ...route.slice(j)
        ];
        
        const newDistance = calculateRouteDistance(newRoute);
        if (newDistance < bestDistance) {
          bestDistance = newDistance;
          bestRoute = [...newRoute];
          improved = true;
        }
      }
    }
    if (improved) {
      route = [...bestRoute];
    }
  }
  
  const endTime = performance.now();
  return { 
    route: bestRoute, 
    totalDistance: Number(bestDistance.toFixed(2)),
    executionTime: Number((endTime - startTime).toFixed(2))
  };
}

// 3-opt algorithm for route improvement
function threeOpt(route: any[]) {
  const startTime = performance.now();
  let improved = true;
  let bestDistance = calculateRouteDistance(route);
  let bestRoute = [...route];
  
  while (improved) {
    improved = false;
    for (let i = 1; i < route.length - 4; i++) {
      for (let j = i + 2; j < route.length - 2; j++) {
        for (let k = j + 2; k < route.length; k++) {
          // Try different 3-opt moves
          const moves = [
            // Move 1: reverse i-j, reverse j-k
            [
              ...route.slice(0, i),
              ...route.slice(i, j).reverse(),
              ...route.slice(j, k).reverse(),
              ...route.slice(k)
            ],
            // Move 2: reverse i-j, reverse i-k
            [
              ...route.slice(0, i),
              ...route.slice(i, j).reverse(),
              ...route.slice(j, k),
              ...route.slice(k).reverse()
            ],
            // Move 3: reverse j-k, reverse i-k
            [
              ...route.slice(0, i),
              ...route.slice(i, j),
              ...route.slice(j, k).reverse(),
              ...route.slice(k).reverse()
            ]
          ];
          
          for (const newRoute of moves) {
            const newDistance = calculateRouteDistance(newRoute);
            if (newDistance < bestDistance) {
              bestDistance = newDistance;
              bestRoute = [...newRoute];
              improved = true;
            }
          }
        }
      }
    }
    if (improved) {
      route = [...bestRoute];
    }
  }
  
  const endTime = performance.now();
  return { 
    route: bestRoute, 
    totalDistance: Number(bestDistance.toFixed(2)),
    executionTime: Number((endTime - startTime).toFixed(2))
  };
}

// Genetic Algorithm for TSP
function geneticAlgorithm(start: any, destinations: any[], populationSize = 30, generations = 50) {
  const startTime = performance.now();
  
  // Handle edge cases
  if (destinations.length === 0) {
    return {
      route: [start],
      totalDistance: 0,
      executionTime: 0
    };
  }
  
  if (destinations.length === 1) {
    const dist = haversine(start.lat, start.lng, destinations[0].lat, destinations[0].lng);
    return {
      route: [start, destinations[0]],
      totalDistance: Number(dist.toFixed(2)),
      executionTime: 0
    };
  }
  
  // Create initial population
  let population: any[][] = [];
  for (let i = 0; i < populationSize; i++) {
    const shuffledDestinations = [...destinations].sort(() => Math.random() - 0.5);
    const route = [start, ...shuffledDestinations];
    population.push(route);
  }
  
  // Fitness function
  const fitness = (route: any[]) => {
    const distance = calculateRouteDistance(route);
    return distance > 0 ? 1 / distance : 1;
  };
  
  // Tournament selection
  const tournamentSelection = (population: any[][]) => {
    const tournamentSize = 3;
    let best = population[Math.floor(Math.random() * population.length)];
    for (let i = 1; i < tournamentSize; i++) {
      const candidate = population[Math.floor(Math.random() * population.length)];
      if (fitness(candidate) > fitness(best)) {
        best = candidate;
      }
    }
    return best;
  };
  
  // Crossover (Order Crossover)
  const crossover = (parent1: any[], parent2: any[]) => {
    const child = new Array(parent1.length);
    child[0] = parent1[0]; // Keep start point
    
    // Simple crossover: take first half from parent1, rest from parent2
    const midPoint = Math.floor(parent1.length / 2);
    for (let i = 1; i < midPoint; i++) {
      child[i] = parent1[i];
    }
    
    // Fill remaining positions from parent2
    let parent2Index = 1;
    for (let i = midPoint; i < child.length; i++) {
      while (child.includes(parent2[parent2Index])) {
        parent2Index++;
      }
      if (parent2Index < parent2.length) {
        child[i] = parent2[parent2Index];
        parent2Index++;
      }
    }
    
    return child;
  };
  
  // Mutation (Swap mutation)
  const mutate = (route: any[]) => {
    const newRoute = [...route];
    if (newRoute.length > 2) {
      const i = Math.floor(Math.random() * (newRoute.length - 1)) + 1;
      const j = Math.floor(Math.random() * (newRoute.length - 1)) + 1;
      if (i !== j) {
        [newRoute[i], newRoute[j]] = [newRoute[j], newRoute[i]];
      }
    }
    return newRoute;
  };
  
  // Evolution
  for (let generation = 0; generation < generations; generation++) {
    const newPopulation = [];
    
    // Elitism: keep best individual
    population.sort((a, b) => fitness(b) - fitness(a));
    newPopulation.push(population[0]);
    
    // Generate new population
    while (newPopulation.length < populationSize) {
      const parent1 = tournamentSelection(population);
      const parent2 = tournamentSelection(population);
      let child = crossover(parent1, parent2);
      
      // Mutation
      if (Math.random() < 0.1) {
        child = mutate(child);
      }
      
      newPopulation.push(child);
    }
    
    population = newPopulation;
  }
  
  // Return best route
  population.sort((a, b) => fitness(b) - fitness(a));
  const bestRoute = population[0];
  const totalDistance = calculateRouteDistance(bestRoute);
  
  const endTime = performance.now();
  return { 
    route: bestRoute, 
    totalDistance: Number(totalDistance.toFixed(2)),
    executionTime: Number((endTime - startTime).toFixed(2))
  };
}

app.post('/api/optimize', (req: Request, res: Response) => {
  const { startPoint, destinations, algorithm } = req.body;
  if (!startPoint || !destinations || !Array.isArray(destinations)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  let result;
  
  switch (algorithm) {
    case 'nearest-neighbor':
      result = nearestNeighbor(startPoint, destinations);
      break;
    case '2-opt':
      const nnResult = nearestNeighbor(startPoint, destinations);
      result = twoOpt(nnResult.route);
      break;
    case '3-opt':
      const nnResult2 = nearestNeighbor(startPoint, destinations);
      result = threeOpt(nnResult2.route);
      break;
    case 'genetic':
      result = geneticAlgorithm(startPoint, destinations);
      break;
    case 'dijkstra':
      if (destinations.length === 1) {
        const dist = haversine(startPoint.lat, startPoint.lng, destinations[0].lat, destinations[0].lng);
        result = {
          route: [startPoint, destinations[0]],
          totalDistance: Number(dist.toFixed(2)),
          executionTime: 0
        };
      } else {
        result = nearestNeighbor(startPoint, destinations);
      }
      break;
    default:
      result = nearestNeighbor(startPoint, destinations);
  }
  
  res.json({
    optimizedRoute: result.route,
    distance: result.totalDistance,
    duration: Math.round(result.totalDistance * 2),
    executionTime: result.executionTime,
    steps: [
      'Start at ' + startPoint.label,
      ...result.route.slice(1).map((d: any) => `Go to ${d.label}`),
      'Arrive at final destination',
    ],
  });
});

// New endpoint to compare all algorithms
app.post('/api/compare-algorithms', (req: Request, res: Response) => {
  const { startPoint, destinations } = req.body;
  if (!startPoint || !destinations || !Array.isArray(destinations)) {
    return res.status(400).json({ error: 'Invalid input' });
  }
  
  const algorithms = ['nearest-neighbor', '2-opt', '3-opt', 'genetic'];
  const results: any = {};
  
  algorithms.forEach(algorithm => {
    try {
      let result;
      switch (algorithm) {
        case 'nearest-neighbor':
          result = nearestNeighbor(startPoint, destinations);
          break;
        case '2-opt':
          const nnResult = nearestNeighbor(startPoint, destinations);
          result = twoOpt(nnResult.route);
          break;
        case '3-opt':
          const nnResult2 = nearestNeighbor(startPoint, destinations);
          result = threeOpt(nnResult2.route);
          break;
        case 'genetic':
          // Add timeout protection for genetic algorithm
          const startTime = Date.now();
          const timeout = 10000; // 10 seconds timeout
          
          try {
            result = geneticAlgorithm(startPoint, destinations);
            const executionTime = Date.now() - startTime;
            if (executionTime > timeout) {
              throw new Error('Genetic algorithm timed out');
            }
          } catch (error) {
            console.error(`Genetic algorithm failed: ${error}`);
            result = nearestNeighbor(startPoint, destinations); // Fallback
          }
          break;
        default:
          result = nearestNeighbor(startPoint, destinations);
      }
      
      results[algorithm] = {
        route: result.route,
        distance: result.totalDistance,
        duration: Math.round(result.totalDistance * 2),
        executionTime: result.executionTime,
        steps: [
          'Start at ' + startPoint.label,
          ...result.route.slice(1).map((d: any) => `Go to ${d.label}`),
          'Arrive at final destination',
        ],
      };
    } catch (error) {
      console.error(`Algorithm ${algorithm} failed:`, error);
      results[algorithm] = { 
        error: `Algorithm ${algorithm} failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        route: [startPoint, ...destinations],
        distance: calculateRouteDistance([startPoint, ...destinations]),
        duration: Math.round(calculateRouteDistance([startPoint, ...destinations]) * 2),
        executionTime: 0,
        steps: [
          'Start at ' + startPoint.label,
          ...destinations.map((d: any) => `Go to ${d.label}`),
          'Arrive at final destination',
        ],
      };
    }
  });
  
  res.json(results);
});

app.post('/api/auth/google', async (req: Request, res: Response) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ message: 'Missing credential' });
  try {
    const ticket = await oAuth2Client.verifyIdToken({ idToken: credential, audience: GOOGLE_CLIENT_ID });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return res.status(400).json({ message: 'Invalid Google token' });
    // Find or create user
    let user = await User.findOne({ email: payload.email });
    if (!user) {
      user = await User.create({
        email: payload.email,
        name: payload.name,
        picture: payload.picture,
        provider: 'google',
      });
    }
    // Issue JWT
    const token = jwt.sign({ _id: user._id, email: user.email, name: user.name }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(401).json({ message: 'Google authentication failed', error: err?.toString() });
  }
});

// Signup endpoint
app.post('/api/auth/signup', async (req: Request, res: Response) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ message: 'Missing fields' });
  }
  try {
    const existing = await User.findOne({ $or: [{ username }, { email }] });
    if (existing) {
      return res.status(409).json({ message: 'User already exists' });
    }
    const user = await User.create({ username, email, password, provider: 'local' });
    const token = jwt.sign({ _id: user._id, username, email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Signup failed', error: err?.toString() });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req: Request, res: Response) => {
  const { username, password } = req.body;
  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "Please sign up, you don't have any account yet" });
    }
    if (user.password !== password) {
      return res.status(401).json({ message: 'Invalid password' });
    }
    const token = jwt.sign({ _id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ message: 'Login failed', error: err?.toString() });
  }
});

// Multer setup for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../../client/public/avatars'));
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const upload = multer({ storage });

// Middleware to authenticate JWT
function authenticate(req: any, res: Response, next: any) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No or invalid token' });
  }
  try {
    const token = auth.split(' ')[1];
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}

// GET /api/user/me
app.get('/api/user/me', authenticate, async (req: any, res: Response) => {
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  res.json({
    username: user.username,
    email: user.email,
    avatar: user.avatar || '',
  });
});

// PUT /api/user/profile (username/email/avatar)
app.put('/api/user/profile', authenticate, async (req: any, res: Response) => {
  const { username, email, avatar } = req.body;
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  let emailChanged = false;
  if (username) user.username = username;
  if (email && email !== user.email) {
    user.email = email;
    emailChanged = true;
  }
  if (avatar) user.avatar = avatar;
  await user.save();
  let token;
  if (emailChanged) {
    // Issue new JWT with updated email
    token = jwt.sign({ _id: user._id, username: user.username, email: user.email }, JWT_SECRET, { expiresIn: '7d' });
  }
  res.json({
    message: 'Profile updated',
    username: user.username,
    email: user.email,
    avatar: user.avatar,
    ...(token ? { token } : {}),
  });
});

// PUT /api/user/password
app.put('/api/user/password', authenticate, async (req: any, res: Response) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.password !== oldPassword) return res.status(401).json({ message: 'Old password incorrect' });
  user.password = newPassword;
  await user.save();
  res.json({ message: 'Password updated' });
});

// POST /api/user/avatar (file upload)
app.post('/api/user/avatar', authenticate, upload.single('avatar'), async (req: any, res: Response) => {
  if (!req.file) return res.status(400).json({ message: 'No file uploaded' });
  // Save avatar URL to user
  const user = await User.findOne({ email: req.user.email });
  if (!user) return res.status(404).json({ message: 'User not found' });
  user.avatar = `/avatars/${req.file.filename}`;
  await user.save();
  res.json({ message: 'Avatar updated', avatar: user.avatar });
});

// --- Journey History API ---

// Get all journey history for logged-in user
app.get('/api/history', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const history = await JourneyHistory.find({ user: userId }).sort({ createdAt: -1 });
    res.json(history);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch history' });
  }
});

// Add a journey to history
app.post('/api/history', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const { route, distance, duration, algorithm } = req.body;
    if (!route || !Array.isArray(route) || typeof distance !== 'number' || typeof duration !== 'number' || !algorithm) {
      return res.status(400).json({ error: 'Missing or invalid fields in request body', received: req.body });
    }
    const entry = new JourneyHistory({ user: userId, route, distance, duration, algorithm });
    await entry.save();
    res.status(201).json(entry);
  } catch (err) {
    console.error('Error saving journey history:', err);
    res.status(400).json({ 
      error: 'Failed to add history', 
      details: err instanceof Error ? err.message : String(err) 
    });
  }
});

// Delete a specific journey history entry
app.delete('/api/history/:id', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    const { id } = req.params;
    const deleted = await JourneyHistory.findOneAndDelete({ _id: id, user: userId });
    if (!deleted) return res.status(404).json({ error: 'Entry not found' });
    res.json({ success: true });
  } catch (err) {
    res.status(400).json({ error: 'Failed to delete entry' });
  }
});

// Clear all journey history for user
app.delete('/api/history', authenticate, async (req: any, res: Response) => {
  try {
    const userId = req.user._id;
    await JourneyHistory.deleteMany({ user: userId });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Failed to clear history' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 