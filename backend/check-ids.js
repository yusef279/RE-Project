const mongoose = require('mongoose');

async function checkIds() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const Classroom = mongoose.model('Classroom', new mongoose.Schema({}, { strict: false }));
    const Game = mongoose.model('Game', new mongoose.Schema({}, { strict: false }));
    const Child = mongoose.model('ChildProfile', new mongoose.Schema({}, { strict: false }));

    const classroomId = '69441cacb895c0a8b7d5553e';
    const childId = '6944242cd619184ff1114cf4';
    const gameId = '69441cacb895c0a8b7d55548';

    console.log('--- Checking Classroom ---');
    const classObj = await Classroom.findById(classroomId);
    console.log('Classroom FindById:', classObj ? 'FOUND' : 'NOT FOUND');
    if (classObj) console.log('TeacherId:', classObj.teacherId);

    const classObj2 = await Classroom.findOne({ _id: classroomId });
    console.log('Classroom FindOne _id:', classObj2 ? 'FOUND' : 'NOT FOUND');

    console.log('\n--- Checking Child ---');
    const childObj = await Child.findById(childId);
    console.log('Child FindById:', childObj ? 'FOUND' : 'NOT FOUND');
    if (childObj) console.log('ParentId:', childObj.parentId);

    console.log('\n--- Checking Game ---');
    const gameObj = await Game.findById(gameId);
    console.log('Game FindById:', gameObj ? 'FOUND' : 'NOT FOUND');

    const allClassrooms = await Classroom.find({});
    console.log('\nAll Classrooms in DB:', allClassrooms.map(c => ({ id: c._id.toString(), name: c.name })));

    const allGames = await Game.find({});
    console.log('All Games in DB:', allGames.map(g => ({ id: g._id.toString(), title: g.title })));

    await mongoose.disconnect();
}
checkIds();
