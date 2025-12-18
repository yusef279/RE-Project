const mongoose = require('mongoose');
const fs = require('fs');

async function check() {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/re_db';
    await mongoose.connect(uri);

    const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
    const ParentProfile = mongoose.model('ParentProfile', new mongoose.Schema({}, { strict: false }));
    const ChildProfile = mongoose.model('ChildProfile', new mongoose.Schema({}, { strict: false }));

    const parentEmail = 'parent@example.eg';
    const user = await User.findOne({ email: parentEmail });
    let log = '';

    if (!user) {
        log += `User ${parentEmail} not found\n`;
    } else {
        log += `User ID: ${user._id}\n`;
        const profile = await ParentProfile.findOne({ userId: user._id });
        if (!profile) {
            log += 'ParentProfile NOT FOUND\n';
        } else {
            log += `ParentProfile ID: ${profile._id}\n`;
            const children = await ChildProfile.find({ parentId: profile._id });
            log += `Children found: ${children.length}\n`;
            children.forEach(c => log += ` - ${c.fullName}, parentId: ${c.parentId}\n`);

            const allChildren = await ChildProfile.find({});
            log += `Total children in DB: ${allChildren.length}\n`;
            allChildren.forEach(c => log += ` - ${c.fullName}, parentId: ${c.parentId}\n`);
        }
    }

    fs.writeFileSync('diag-output.txt', log);
    await mongoose.disconnect();
}
check();
