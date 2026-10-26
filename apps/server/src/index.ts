import { createApp } from './app.js';
import { config } from './config.js';
import { startJobs } from './services/jobs.js';

createApp().listen(config.PORT, () => {
  console.log(`Knowzone API listening on http://localhost:${config.PORT}`);
});
startJobs();
