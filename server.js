const express = require('express');
const { generateETag } = require('./utils/EtagUtils');
const app = express();
const PORT = 8000;

app.use(express.json());

const apiKeyMiddleware = require('./middlewares/apiKeyMiddleware');
const filmRoutes = require('./routes/films');
const actorRoutes = require('./routes/actors');
const genreRoutes = require('./routes/genres');

app.use('/api', apiKeyMiddleware,filmRoutes);
app.use('/api', apiKeyMiddleware,actorRoutes);
app.use('/api', apiKeyMiddleware,genreRoutes);

  
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
  