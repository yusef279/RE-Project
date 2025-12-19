const mongoose = require('mongoose');

async function trace() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));

    const targetId = '69441cacb895c0a8b7d55548';
    const game = await Game.findById(targetId);

    if (!game) {
        console.log(`Game ${targetId} NOT FOUND`);
        const all = await Game.find({});
        console.log('Available Game IDs:', all.map(g => g._id.toString()));
    } else {
        console.log(`Game ${targetId} FOUND:`, game.title);
    }

    await mongoose.disconnect();
}
trace();
