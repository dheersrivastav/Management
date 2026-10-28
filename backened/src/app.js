import express from 'express';
import leadRouter from './routes/leads.js';
export const app = express();
app.use(express.json({ limit: '10kb'}));
app.use('/api/leads', leadRouter);
app.use((req, res) => res.status(404).json({error: 'router not found.'}));
app.use((err, req, res, next) => {
    if(err.type==='entry.parse.failed')
        return res.status(400).json({error:'malformed JSON bosy.'});
    console.error(err);
    res.status(500).json({error: 'unexpected server error.'});
});