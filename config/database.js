import mongoose from 'mongoose';

// Connect to MongoDB
export const connectDatbase = async () => {
    try {
        const { connection } = await mongoose.connect(process.env.MONGO_URL);
    console.log(`MongoDB connected: ${connection.host}`)
    } catch (error) {
        console.log(error);
        process.exit(1)
    }
    
};
//     {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//     },
//   );
// };
