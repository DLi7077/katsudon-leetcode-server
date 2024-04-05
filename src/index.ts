import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import generateRoutes from './routes';

const app = express();
app.use(cors({ origin: '*' }));
app.use(bodyParser.json());

const port: any = process.env.PORT || 3001;

app.listen(port, async () => {
  console.log(`Express listening at port ${port}`);
  console.log(`Test apis with http://localhost:${port}/api`);
});

generateRoutes(app);
