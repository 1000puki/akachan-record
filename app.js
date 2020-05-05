var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var helmet = require('helmet');
var session = require('express-session');
var passport = require('passport');

var GitHubStrategy = require('passport-github2').Strategy;
var GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID || '66ce9f09781547119049';
var GITHUB_CLIENT_SECRET = process.env.GITHUB_CLIENT_SECRET || 'afe21f6351f246004111bd9718d1ef4e5db7e016';

//Routerオブジェクトの追加
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var loginRouter = require('./routes/login');
var logoutRouter = require('./routes/logout');
var babiesRouter = require('./routes/babies');

//Modelオブジェクトの追加
var User = require('./models/user');
var Baby = require('./models/babies');
var BreaseFeeding = require('./models/breasefeedings');
var Diper = require('./models/dipers');

//Modelリレーション設定（従属性）
User.sync().then(() => {
  Baby.belongsTo(User, {foreignKey: 'userId'});
  Baby.sync().then(() => {
    BreaseFeeding.belongsTo(Baby, {foreignKey: 'babyId'});
    BreaseFeeding.sync();
    Diper.belongsTo(Baby, {foreignKey: 'babyId'});
    Diper.sync();
  });
});


var app = express();
//Express ResponseHeaderセキュリティ対策
app.use(helmet());

app.use(session({secret: '6779484ff023bbee', resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function (user, done){
  done(null, user);
});

passport.deserializeUser(function (obj, done){
  done(null, obj);
});

passport.use(new GitHubStrategy({
  clientID: GITHUB_CLIENT_ID,
  clientSecret: GITHUB_CLIENT_SECRET,
  callbackURL: process.env.HEROKU_URL ? process.env.HEROKU_URL + 'auth/github/callback' : 'http://localhost:8000/auth/github/callback'
},
  function (accessToken, refreshToken, profile, done){
    process.nextTick(function (){
      //認証完了後に、Userテーブルの更新テスト
      User.upsert({
        userId: profile.id,
        username: profile.username
      }).then(() => {
        done(null, profile);
      });
    });
  }
));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routerのハンドラを実装する（ルーティング）
//Default Handler
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/login', loginRouter);
app.use('/logout', logoutRouter);
app.use('/babies', babiesRouter);

//GitHub認証のハンドラ
app.get('/auth/github', 
  passport.authenticate('github', {scope: ['user:email']}),
  function(req, res){
  });
//GitHub認証後のコールバック
app.get('/auth/github/callback',
  passport.authenticate('github', {failureRedirect: '/login'}),
  function(req, res){
    res.redirect('/');
  });

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
