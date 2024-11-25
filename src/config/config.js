import dotenv from 'dotenv';
dotenv.config();
export default {
    HOST: process.env.HOST || 'localhost',
    PORT: process.env.PORT || 3020,
    API_URL: process.env.API_URL || '/api/v1',

    CONNECTION_STRING: process.env.CONNECTION_STRING,
    DATABASE: process.env.DATABASE,  
    DB_USER: process.env.DB_USER,
    DB_PASSWORD: process.env.DB_PASSWORD 
}
