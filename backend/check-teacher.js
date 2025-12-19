const mongoose = require('mongoose');

async function check() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const TeacherProfile = mongoose.model('TeacherProfile', new mongoose.Schema({}, { strict: false }));
    const Classroom = mongoose.model('Classroom', new mongoose.Schema({}, { strict: false }));

    const teacherEmail = 'teacher@school.eg';
    const user = await User.findOne({ email: teacherEmail });

    if (!user) {
        console.log(`User ${teacherEmail} not found`);
    } else {
        console.log(`User ID: ${user._id}`);
        const profile = await TeacherProfile.findOne({ userId: user._id });
        if (!profile) {
            console.log('TeacherProfile NOT FOUND');
        } else {
            console.log(`TeacherProfile ID: ${profile._id}`);
            const classrooms = await Classroom.find({ teacherId: profile._id });
            console.log(`Classrooms found for this profile: ${classrooms.length}`);
            classrooms.forEach(c => console.log(` - ${c.name}, teacherId: ${c.teacherId}`));

            const allClassrooms = await Classroom.find({});
            console.log(`Total classrooms in DB: ${allClassrooms.length}`);
            allClassrooms.forEach(c => console.log(` - ${c.name}, teacherId: ${c.teacherId}`));
        }
    }

    await mongoose.disconnect();
}
check();
