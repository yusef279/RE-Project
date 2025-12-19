const mongoose = require('mongoose');

async function check() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const classroomSchema = new mongoose.Schema({ name: String, teacherId: mongoose.Schema.Types.ObjectId }, { strict: false });
    const teacherSchema = new mongoose.Schema({ fullName: String, userId: mongoose.Schema.Types.ObjectId }, { strict: false });

    const Classroom = mongoose.model('Classroom', classroomSchema);
    const TeacherProfile = mongoose.model('TeacherProfile', teacherSchema);

    const teacher = await TeacherProfile.findOne({ fullName: /Fatima/ });
    console.log('Teacher Profile:', teacher ? { _id: teacher._id, fullName: teacher.fullName } : 'NOT FOUND');

    const classrooms = await Classroom.find({});
    console.log('Total Classrooms:', classrooms.length);
    classrooms.forEach(c => {
        console.log('Classroom:', { _id: c._id, name: c.name, teacherId: c.teacherId });
    });

    await mongoose.disconnect();
}
check();
