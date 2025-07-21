module.exports = (app) => {
    app.use('/api/users', require('./user.route'))
    app.use('/api/comments', require('./comment.route'))
    app.use('/api/posts', require('./post.route'));
    app.use('/api/likes', require('./like.route'));
    app.use('/api/follows', require('./follow.route'));
    app.use('/api/messages', require('./message.route'));
    app.use('/api/notifications', require('./notification.route'));
    app.use('/api/upload', require('./upload.js'));
    app.use('/api/banned_keywords', require('./bannedKeywords.route'));
    // app.use('/api/gemini', require('./gemini.route'));
}