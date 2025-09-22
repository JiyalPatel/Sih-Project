const express = require('express');
const mongoose = require('mongoose');


const app = express();

app.listen(8080, () => {
    console.log('Server is running on http://localhost:8080/');
});