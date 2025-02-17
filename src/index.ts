import express from 'express';
import cors from "cors";
import dotenv from 'dotenv';
import { connectDB } from './config/dbConfig';
import authRoutes from "./routes/authRoutes"
import propertyRoutes from "./routes/propertyRoutes";
// import blogRoutes from "./routes/blogRoutes";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
app.use(express.json());

app.use(cors({ origin: '*' }));

app.use('/auth', authRoutes);
app.use('/property', propertyRoutes);
// app.use('/blog', blogRoutes);

const startServer = async() => {
  app.listen(PORT, async() => {
    await connectDB();
    console.log(`Server running on port ${PORT}`);
  });
};
  
startServer();