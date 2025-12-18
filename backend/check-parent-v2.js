const mongoose = require('mongoose');

async function check() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const ParentProfile = mongoose.model('ParentProfile', new mongoose.Schema({}, { strict: false }));
    const ChildProfile = mongoose.model('ChildProfile', new mongoose.Schema({}, { strict: false }));

    const user = await User.findOne({ email: 'parent@example.eg' });
    if (!user) {
        console.log('USER parent@example.eg NOT FOUND');
        return;
    }
    console.log('User ID:', user._id.toString());

    const profile = await ParentProfile.findOne({ userId: user._id });
    if (!profile) {
        console.log('PROFILE for User NOT FOUND');
        return;
    }
    console.log('Profile ID:', profile._id.toString());

    const children = await ChildProfile.find({ parentId: profile._id });
    console.log('Children found for this profile:', children.length);
    for (const c of children) {
        console.log(` - Child: ${c.fullName}, ID: ${c._id.toString()}, parentId: ${c.parentId.toString()}`);
    }

    const allChildren = await ChildProfile.find({});
    console.log('Total children in DB:', allChildren.length);
    for (const c of allChildren) {
        console.log(` - DB Child: ${c.fullName}, parentId: ${c.parentId.toString()}`);
    }

    await mongoose.disconnect();
}
check().catch(console.error);
