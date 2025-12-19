const mongoose = require('mongoose');

async function checkIds() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const Classroom = mongoose.model('Classroom', new mongoose.Schema({}, { strict: false }));
    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));
    const Child = mongoose.model('ChildProfile', new mongoose.Schema({}, { strict: false }));

    console.log('\n--- CLASSROOMS ---');
    const allClassrooms = await Classroom.find({});
    allClassrooms.forEach(c => console.log(`${c._id} | ${c.name} | teacherId: ${c.teacherId}`));

    console.log('\n--- GAMES ---');
    const allGames = await Game.find({});
    allGames.forEach(g => console.log(`${g._id} | ${g.title}`));

    console.log('\n--- CHILDREN ---');
    const allChildren = await Child.find({});
    allChildren.forEach(c => console.log(`${c._id} | ${c.fullName} | parentId: ${c.parentId}`));

    await mongoose.disconnect();
}
checkIds();
