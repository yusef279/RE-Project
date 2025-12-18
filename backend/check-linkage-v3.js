const mongoose = require('mongoose');

async function check() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const ParentProfile = mongoose.model('ParentProfile', new mongoose.Schema({}, { strict: false }));
    const ChildProfile = mongoose.model('ChildProfile', new mongoose.Schema({}, { strict: false }));

    const parentEmail = 'parent@example.eg';
    const user = await User.findOne({ email: parentEmail });

    if (!user) {
        console.log(`User ${parentEmail} not found`);
    } else {
        console.log(`User: ${parentEmail}, ID: ${user._id}`);
        const profile = await ParentProfile.findOne({ userId: user._id });
        if (!profile) {
            console.log('ParentProfile NOT FOUND for this user');
        } else {
            console.log(`ParentProfile ID: ${profile._id}, FullName: ${profile.fullName}`);

            const children = await ChildProfile.find({ parentId: profile._id });
            console.log(`Children for Profile ${profile._id}: ${children.length}`);
            children.forEach(c => console.log(` - ${c.fullName}, parentId: ${c.parentId}`));

            const orphanChildren = await ChildProfile.find({ parentId: { $ne: profile._id } });
            console.log(`Other children in DB: ${orphanChildren.length}`);
            orphanChildren.forEach(c => console.log(` - ${c.fullName}, parentId: ${c.parentId}`));
        }
    }

    await mongoose.disconnect();
}
check();
