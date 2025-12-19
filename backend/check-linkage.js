const mongoose = require('mongoose');

async function check() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const userSchema = new mongoose.Schema({ email: String }, { strict: false });
    const teacherSchema = new mongoose.Schema({ fullName: String, userId: mongoose.Schema.Types.ObjectId }, { strict: false });
    const classroomSchema = new mongoose.Schema({ name: String, teacherId: mongoose.Schema.Types.ObjectId }, { strict: false });

    const User = mongoose.model('User', userSchema);
    const TeacherProfile = mongoose.model('TeacherProfile', teacherSchema);
    const Classroom = mongoose.model('Classroom', classroomSchema);

    const user = await User.findOne({ email: 'teacher@school.eg' });
    console.log('User:', user ? { _id: user._id, email: user.email } : 'NOT FOUND');

    if (user) {
        const profile = await TeacherProfile.findOne({ userId: user._id });
        console.log('Profile:', profile ? { _id: profile._id, userId: profile.userId, fullName: profile.fullName } : 'NOT FOUND');

        if (profile) {
            const classrooms = await Classroom.find({ teacherId: profile._id });
            console.log('Classrooms for Profile:', classrooms.length);
            classrooms.forEach(c => console.log(' - ' + c.name));
        }
    }

    await mongoose.disconnect();
}
check();
