import mongoose from 'mongoose'; 
import config from './config'; 

(async () => { 
    try { 
        const db = await mongoose.connect(config.CONNECTION_STRING, { 
            dbName: config.DATABASE 
        }); 
        console.log('Database is connected to: ', db.connection.name); 
    } catch (error) { 
        console.log('Error: ', error); 
    } 
})();