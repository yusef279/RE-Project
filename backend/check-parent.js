const mongoose = require('mongoose');

async function check() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const userSchema = new mongoose.Schema({ email: String }, { strict: false });
    const parentSchema = new mongoose.Schema({ fullName: String, userId: mongoose.Schema.Types.ObjectId }, { strict: false });
    const childSchema = new mongoose.Schema({ fullName: String, parentId: mongoose.Schema.Types.ObjectId }, { strict: false });

    const User = mongoose.model('User', userSchema);
    const ParentProfile = mongoose.model('ParentProfile', parentSchema);
    const ChildProfile = mongoose.model('ChildProfile', childSchema);

    const user = await User.findOne({ email: 'parent@example.eg' });
    console.log('User:', user ? { _id: user._id, email: user.email } : 'NOT FOUND');

    if (user) {
        const profile = await ParentProfile.findOne({ userId: user._id });
        console.log('Profile:', profile ? { _id: profile._id.toString(), userId: profile.userId.toString(), fullName: profile.fullName } : 'NOT FOUND');

        if (profile) {
            const children = await ChildProfile.find({ parentId: profile._id });
            console.log('Children for Profile:', children.length);
            children.forEach(c => console.log(' - ' + c.fullName + ' (parentId: ' + c.parentId.toString() + ')'));

            const allChildren = await ChildProfile.find({});
            console.log('--- ALL CHILDREN IN DB ---');
            allChildren.forEach(c => console.log(' - ' + c.fullName + ' (parentId: ' + c.parentId.toString() + ')'));
        }
    }

    await mongoose.disconnect();
}
check();
