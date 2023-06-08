const express = require('express');
const app = express();
const mongoose = require('mongoose');
const adminRoutes = require('./routes/adminRoutes');
const swaggerUi = require('swagger-ui-express')
const YAML = require('yamljs')
const swaggerDocument = YAML.load('swagger.yaml');
const cors = require('cors');
const path = require('path');

//middleware
//43.205.235.111
app.use(express.json());
app.use(cors());
app.use("/public", express.static(path.join(__dirname, 'public')));
//change here
mongoose.connect('//link', { useNewUrlParser: true, useUnifiedTopology: true })
    .then((result) => {
        console.log("Database connected");
        app.listen(3000);
    })
    .catch((error) => {
        console.log(error);
    })

app.use('/api/v1', adminRoutes);
// Serve the Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))