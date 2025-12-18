const mongoose = require('mongoose');

async function trace() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const Classroom = mongoose.model('Classroom', new mongoose.Schema({}, { strict: false }));
    const TeacherProfile = mongoose.model('TeacherProfile', new mongoose.Schema({}, { strict: false }));

    const targetId = '69441cacb895c0a8b7d5553e';
    const classroom = await Classroom.findById(targetId);

    if (!classroom) {
        console.log(`Classroom ${targetId} NOT FOUND`);
    } else {
        console.log(`Classroom ${targetId} FOUND:`, classroom.name);
        console.log(`TeacherId on Classroom: ${classroom.teacherId}`);

        const teacher = await TeacherProfile.findById(classroom.teacherId);
        if (teacher) {
            console.log(`TeacherProfile FOUND: ${teacher.fullName}, userId: ${teacher.userId}`);
        } else {
            console.log(`TeacherProfile ${classroom.teacherId} NOT FOUND`);
        }
    }

    await mongoose.disconnect();
}
trace();
