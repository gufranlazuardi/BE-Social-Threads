import dotenv from "dotenv"
dotenv.config();

import app from './app'

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
    // console.log(`Environment: ${process.env.NODE_ENV}`);
    // Add this log to verify JWT_SECRET is loaded
    // console.log(`JWT_SECRET loaded: ${process.env.JWT_SECRET ? 'Yes' : 'No'}`);
})