import express from 'express';
import cors from 'cors';
import addRoutes from '../Backend/routes/addRoute.js'
import authRoutes from '../Backend/routes/authRoutes.js'
import getRoutes from '../Backend/routes/getRoute.js'
import deleteRoutes from '../Backend/routes/deleteRoute.js'
import updateRoutes from '../Backend/routes/updateRoute.js'
import emailRoutes from '../Backend/routes/emailRoute.js'
import reportRoutes from '../Backend/routes/reportRoute.js'


const app = express();
app.use(express.json());
app.use(cors(
    {
        origin:"*",
        methods:['GET , POST ,PUT','DELETE'],
        credentials:true
      }
      ))
      
app.use('/api/auth',authRoutes)
app.use('/api/add', addRoutes)
app.use('/api/get', getRoutes)
app.use('/api/update', updateRoutes)
app.use('/api/delete', deleteRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/report', reportRoutes)


app.listen(8081, () => {
  console.log('Server is running');
});
