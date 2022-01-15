const express = require('express');
const app = express();
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
require('dotenv').config();

const routes = require('./Routes/index')
const port = process.env.PORT || 5001;

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use(bodyParser.json());
app.use((request, response, next) => {
    response.setHeader('Access-Control-Allow-Origin', '*');
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    response.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

app.use('/', routes);

mongoose.connect(
    // 'mongodb+srv://team8:Team8Go@cluster0.t6yet.mongodb.net/OnlineLawSystem?retryWrites=true&w=majority',
    'mongodb+srv://team8:Team8Go@cluster0.et3ws.mongodb.net/OnlineLawSystem?retryWrites=true&w=majority',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
).then(success => {
    console.log('Connected to MongoDB !!');
    app.listen(port, () => {
        console.log(`Server is up and running on port: ${port}`);
    })
}).catch(err => {
    console.log('Error connecting to MongoDB : ' + err);
});
