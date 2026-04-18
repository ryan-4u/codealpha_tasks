const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Post = require('./models/Post');
const Comment = require('./models/Comment');

const users = [
  {
    name: 'Theo Browne',
    username: 'theo',
    email: 'theo@devcircle.dev',
    bio: 'Building t3.gg | Founder @ping.gg | Talks too much about TypeScript',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/@t3dotgg' },
      { name: 'Twitter/X', url: 'https://twitter.com/t3dotgg' },
      { name: 'Website', url: 'https://t3.gg' }
    ]
  },
  {
    name: 'Fireship',
    username: 'fireship',
    email: 'fireship@devcircle.dev',
    bio: 'High-intensity ⚡ code tutorials. 100 seconds or less.',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/@Fireship' },
      { name: 'Website', url: 'https://fireship.io' },
      { name: 'Twitter/X', url: 'https://twitter.com/fireship_dev' }
    ]
  },
  {
    name: 'Brad Traversy',
    username: 'bradtraversy',
    email: 'brad@devcircle.dev',
    bio: 'Full stack web dev & instructor. Traversy Media. Teaching since 2009.',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/@TraversyMedia' },
      { name: 'Website', url: 'https://traversymedia.com' },
      { name: 'Twitter/X', url: 'https://twitter.com/traversymedia' }
    ]
  },
  {
    name: 'Josh Werner',
    username: 'joshtriedcoding',
    email: 'josh@devcircle.dev',
    bio: 'I tried coding. Still trying. Building things with Next.js & TypeScript.',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/@joshtriedcoding' },
      { name: 'Twitter/X', url: 'https://twitter.com/joshtriedcoding' }
    ]
  },
  {
    name: 'Kevin Powell',
    username: 'kevinpowell',
    email: 'kevin@devcircle.dev',
    bio: 'Helping people fall in love with CSS. The CSS Evangelist.',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/@KevinPowell' },
      { name: 'Website', url: 'https://www.kevinpowell.co' },
      { name: 'Twitter/X', url: 'https://twitter.com/kevin_j_powell' }
    ]
  },
  {
    name: 'Tanay Pratap',
    username: 'tanaypratap',
    email: 'tanay@devcircle.dev',
    bio: 'Engineer. Educator. Building neogcamp. Ex-Microsoft. India ke devs ke liye.',
    links: [
      { name: 'Twitter/X', url: 'https://twitter.com/tanaypratap' },
      { name: 'YouTube', url: 'https://www.youtube.com/@tanaypratap' },
      { name: 'neogcamp', url: 'https://neog.camp' }
    ]
  },
  {
    name: 'Kunal Kushwaha',
    username: 'kunalkushwaha',
    email: 'kunal@devcircle.dev',
    bio: 'DevRel | Open Source | Community | CNCF Ambassador | Making devs job-ready.',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/@KunalKushwaha' },
      { name: 'GitHub', url: 'https://github.com/kunal-kushwaha' },
      { name: 'Twitter/X', url: 'https://twitter.com/kunalstwt' }
    ]
  },
  {
    name: 'Hitesh Choudhary',
    username: 'hiteshchoudhary',
    email: 'hitesh@devcircle.dev',
    bio: 'Chai aur Code ☕ | CEO @LCO | Teaching JavaScript, Python & more. Hamesha seekhte raho.',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/@HiteshCodeLab' },
      { name: 'Website', url: 'https://hiteshchoudhary.com' },
      { name: 'Twitter/X', url: 'https://twitter.com/Hitesh_tech' }
    ]
  },
  {
    name: 'Piyush Garg',
    username: 'piyushgarg',
    email: 'piyush@devcircle.dev',
    bio: 'Building @CometLabs | Teaching Node.js, DevOps & system design in Hindi.',
    links: [
      { name: 'YouTube', url: 'https://www.youtube.com/@piyushgargdev' },
      { name: 'Twitter/X', url: 'https://twitter.com/piyushgarg_dev' },
      { name: 'GitHub', url: 'https://github.com/piyushgarg-dev' }
    ]
  },
  {
    name: 'Aaryan Aggrawa',
    username: 'ryan-4u',
    email: 'aaryanaggrawa.dev@gmail.com',
    bio: 'Final year CS student | MERN Stack Dev | Building in public | 0 to 1. Far from done.',
    links: [
      { name: 'GitHub', url: 'https://github.com/ryan-4u' },
      { name: 'Portfolio', url: 'https://aaryan-aggrawa-v1.netlify.app' },
      { name: 'Instagram', url: 'https://instagram.com/aaryan.0to1' }
    ]
  }
];

const postContents = [
  { username: 'theo', content: 'TypeScript is not optional anymore. If you are building anything serious in 2026 without TS, you are making your future self suffer. The DX improvement alone is worth it.' },
  { username: 'theo', content: 'Hot take: tRPC + Next.js is the most productive stack for indie hackers right now. You ship faster, you break less, and your API is always in sync with your frontend.' },
  { username: 'fireship', content: 'New video dropping tomorrow: "I built a SaaS in 100 seconds" — okay it took longer but the edit makes it look clean ⚡' },
  { username: 'fireship', content: 'Every framework in 2026 has "zero config", "blazing fast", and "production ready" in its README. None of them mean the same thing.' },
  { username: 'bradtraversy', content: 'Just pushed a new MERN stack crash course. 6 hours, zero fluff. Build a full social platform from scratch. Link in bio 🚀' },
  { username: 'bradtraversy', content: 'Reminder: you do not need to learn every framework. Pick one, go deep, build real projects. That is how you get hired.' },
  { username: 'joshtriedcoding', content: 'Day 47 of building my SaaS. Revenue: $0. Lessons learned: infinite. Quitting: not an option.' },
  { username: 'joshtriedcoding', content: 'Next.js app router still confuses me sometimes and I have been using it for a year. You are not alone.' },
  { username: 'kevinpowell', content: 'CSS Grid and Flexbox are not competing tools. Grid is for layout. Flexbox is for alignment. Use both. Stop the debate.' },
  { username: 'kevinpowell', content: 'The :has() selector is genuinely one of the most powerful things added to CSS in years. Go learn it today, thank me later.' },
  { username: 'tanaypratap', content: 'Jo log kehte hain "coding sikhna mushkil hai" — unhe sirf sahi mentor nahi mila. Sahi guidance se koi bhi sikh sakta hai. Bas shuru karo.' },
  { username: 'tanaypratap', content: 'India mein ek bada problem hai: log certificate ke liye seekhte hain, skill ke liye nahi. Real world mein sirf skills count karti hain.' },
  { username: 'kunalkushwaha', content: 'Open source contribution is the best resume you can have. No one can fake a merged PR. Start small — fix a typo, improve docs, then go deeper.' },
  { username: 'kunalkushwaha', content: 'DevOps is not a role, it is a culture. When devs understand infrastructure and ops understands code — magic happens.' },
  { username: 'hiteshchoudhary', content: 'Chai pi lo, code karo. Har roz thoda thoda seekhte raho. Ek din aayega jab sab clear ho jayega. That is how mastery works ☕' },
  { username: 'hiteshchoudhary', content: 'JavaScript ka async/await samajh aaya? Good. Ab event loop samjho. Phir V8 engine. Depth se seekhne wale hi senior bante hain.' },
  { username: 'piyushgarg', content: 'Node.js mein ek cheez jo bahut log miss karte hain: streams. Agar aap large files process karte ho bina streams ke — aap memory waste kar rahe ho.' },
  { username: 'piyushgarg', content: 'System design sikhna shuru karo agar aap serious developer banna chahte ho. Interview mein yahi difference create karta hai senior aur junior mein.' },
  { username: 'ryan-4u', content: 'Built DevCircle as part of my CodeAlpha internship. Full stack MERN app with JWT auth, Cloudinary uploads, follow system and real-time feed. Shipping every day 🚀' },
  { username: 'ryan-4u', content: 'Day 12 of Operation: Build Myself. DSA in the morning, full stack in the evening, gym at night. Slow progress is still progress. 0 to 1. Far from done.' }
];

const commentData = [
  { postIndex: 0, username: 'fireship', content: 'TypeScript saved my codebase more times than I can count. 100% agree.' },
  { postIndex: 0, username: 'bradtraversy', content: 'Agreed. I resisted it for years. Now I cannot imagine going back.' },
  { postIndex: 2, username: 'theo', content: 'Already liked and subscribed. Fireship never misses.' },
  { postIndex: 4, username: 'kunalkushwaha', content: 'Sharing this with every beginner I mentor. Brad always delivers.' },
  { postIndex: 8, username: 'tanaypratap', content: 'Kevin bhai CSS ke baare mein bilkul sahi keh rahe hain. Grid + Flex = unstoppable.' },
  { postIndex: 10, username: 'hiteshchoudhary', content: 'Bilkul sahi baat. Sikhna skill ke liye chahiye, certificate ke liye nahi.' },
  { postIndex: 12, username: 'piyushgarg', content: 'Open source ne meri career change kar di. Best advice ever.' },
  { postIndex: 18, username: 'tanaypratap', content: 'Great work Aaryan! Keep building and shipping. This is how you grow.' },
  { postIndex: 18, username: 'hiteshchoudhary', content: 'MERN stack + Cloudinary — solid choice. Portfolio mein add karo zaroor.' },
  { postIndex: 19, username: 'kunalkushwaha', content: 'Consistency is the real skill. Keep going!' },
];

const followData = [
  { follower: 'ryan-4u', following: 'theo' },
  { follower: 'ryan-4u', following: 'fireship' },
  { follower: 'ryan-4u', following: 'hiteshchoudhary' },
  { follower: 'ryan-4u', following: 'piyushgarg' },
  { follower: 'ryan-4u', following: 'tanaypratap' },
  { follower: 'theo', following: 'fireship' },
  { follower: 'theo', following: 'joshtriedcoding' },
  { follower: 'fireship', following: 'theo' },
  { follower: 'fireship', following: 'kevinpowell' },
  { follower: 'bradtraversy', following: 'kevinpowell' },
  { follower: 'bradtraversy', following: 'hiteshchoudhary' },
  { follower: 'tanaypratap', following: 'kunalkushwaha' },
  { follower: 'tanaypratap', following: 'hiteshchoudhary' },
  { follower: 'kunalkushwaha', following: 'piyushgarg' },
  { follower: 'hiteshchoudhary', following: 'piyushgarg' },
  { follower: 'piyushgarg', following: 'hiteshchoudhary' },
  { follower: 'joshtriedcoding', following: 'theo' },
  { follower: 'kevinpowell', following: 'bradtraversy' },
];

const likeData = [
  { postIndex: 0, username: 'bradtraversy' },
  { postIndex: 0, username: 'kunalkushwaha' },
  { postIndex: 0, username: 'ryan-4u' },
  { postIndex: 1, username: 'fireship' },
  { postIndex: 1, username: 'joshtriedcoding' },
  { postIndex: 2, username: 'theo' },
  { postIndex: 2, username: 'ryan-4u' },
  { postIndex: 4, username: 'kunalkushwaha' },
  { postIndex: 4, username: 'ryan-4u' },
  { postIndex: 6, username: 'theo' },
  { postIndex: 8, username: 'tanaypratap' },
  { postIndex: 8, username: 'ryan-4u' },
  { postIndex: 10, username: 'hiteshchoudhary' },
  { postIndex: 12, username: 'piyushgarg' },
  { postIndex: 12, username: 'ryan-4u' },
  { postIndex: 18, username: 'tanaypratap' },
  { postIndex: 18, username: 'hiteshchoudhary' },
  { postIndex: 18, username: 'kunalkushwaha' },
  { postIndex: 19, username: 'fireship' },
  { postIndex: 19, username: 'piyushgarg' },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected');

    // Clear existing data
    await User.deleteMany({});
    await Post.deleteMany({});
    await Comment.deleteMany({});
    console.log('Cleared existing data');

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('Test@2026', salt);

    // Create users
    const createdUsers = {};
    for (const userData of users) {
      const avatarName = encodeURIComponent(userData.name);
      const user = new User({
        ...userData,
        password: hashedPassword,
        avatar: `https://ui-avatars.com/api/?background=58a6ff&color=0d1117&name=${avatarName}&size=128&bold=true`
      });
      await user.save();
      createdUsers[userData.username] = user;
      console.log(`Created user: ${userData.username}`);
    }

    // Create posts
    const createdPosts = [];
    for (const postData of postContents) {
      const author = createdUsers[postData.username];
      const post = new Post({
        author: author._id,
        content: postData.content
      });
      await post.save();
      createdPosts.push(post);
      console.log(`Created post by: ${postData.username}`);
    }

    // Create follows
    for (const follow of followData) {
      const followerUser = createdUsers[follow.follower];
      const followingUser = createdUsers[follow.following];
      await User.findByIdAndUpdate(followingUser._id, {
        $push: { followers: followerUser._id }
      });
      await User.findByIdAndUpdate(followerUser._id, {
        $push: { following: followingUser._id }
      });
    }
    console.log('Created follows');

    // Create likes
    for (const like of likeData) {
      const likerUser = createdUsers[like.username];
      await Post.findByIdAndUpdate(createdPosts[like.postIndex]._id, {
        $push: { likes: likerUser._id }
      });
    }
    console.log('Created likes');

    // Create comments
    for (const comment of commentData) {
      const author = createdUsers[comment.username];
      const post = createdPosts[comment.postIndex];
      const newComment = new Comment({
        post: post._id,
        author: author._id,
        content: comment.content
      });
      await newComment.save();
    }
    console.log('Created comments');

    console.log('\n✅ Seed complete!');
    console.log('All users password: Test@2026');
    console.log('Your account: ryan-4u / aaryanaggrawa.dev@gmail.com');
    process.exit(0);

  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
};

seed();