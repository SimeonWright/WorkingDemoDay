const { isObject } = require("lodash");
// ObjectID is for the 'read more' button on post ya emotions 
var ObjectId = require('mongodb').ObjectID;

module.exports = function(app, passport, db) {

// normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function(req, res) {
        res.render('index.ejs');
    });

    // PROFILE SECTION =========================
    app.get('/profile', isLoggedIn, function(req, res) {
        db.collection('messages').find().toArray((err, result) => {
          if (err) return console.log(err)
          res.render('profile.ejs', {
            user : req.user,
            messages: result
          })
        })
    });

    // LOGOUT ==============================
    app.get('/logout', function(req, res) {
        req.logout();
        res.redirect('/');
    });

    // FIND DOCTOR ==========
    app.get('/doctor', function(req, res) {
      db.collection('messages').find().toArray((err, result) => {
        if (err) return console.log(err)
        res.render('doctor.ejs', {
          user : req.user,
          messages: result
        })
      })
      // res.redirect('/doctor');
  });





  //////blog to emtoions///
  app.get('/emotions', isLoggedIn, function(req, res) {
    //  think of it as issuing a database query
    db.collection('postyaemotions').find().toArray((err, result) => {
      if (err) return console.log(err)
      console.log(result)
      res.render('emotions.ejs', {
        // these below are the collections within the db
        user: req.email,
        article: result,
        // what information do you want to get from the DB to display on your browser?
      })
    })
  });


  // ///// post ya Emotion page///////
  app.get('/postyaemotions', isLoggedIn, function(req, res) {
    db.collection('postyaemotions').find().toArray((err, result) => {
      // it is going into the DB to find this info in the function below
      if (err) return console.log(err)

      res.render('postyaemotions.ejs', {
        user: req.user,
        title: String,
        createdAt: new Date(),
        description: String,
        bpost: String,
      })
    })
  });
///// loading the new emotions onto emotions pagae///
app.post('/postyaemotions', (req, res) => {
  db.collection('postyaemotions').save({
    user: req.user,
    title: req.body.title,
    createdAt: new Date(),
    description: req.body.description,
    bpost: req.body.blogpost,
  }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/emotions')
  })
})

/////// Read More Button//////
app.post('/viewemotion', (req, res) => {
  db.collection('postyaemotions').save({
    user: req.user,
    title: req.body.title,
    createdAt: new Date(),
    description: req.body.description,
    bpost: req.body.blogpost,
  }, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/viewemotion')
  })
})

app.get('/viewemotion/:joker', isLoggedIn, function(req, res) {
  let post = ObjectId(req.params.joker)
  //  think of it as issuing a database query
  db.collection('postyaemotions').find({
     _id: post
  }).toArray((err, result) => {
    if (err) return console.log(err)
    console.log(result, 'what can i fix')
    res.render('viewemotion.ejs', {
      joker: result,
      user: req.user
      // what information do you want to get from the DB to display on your browser?
    })
  })
});

//// edit page //// 
app.get('/edit/:articleId', isLoggedIn, function(req, res) {
  let articleId = ObjectId(req.params.articleId)
  //think of it as issuing a database query
  db.collection('postyaemotions').findOne({
    _id: articleId
  }, (err, result) => {
    if (err) return console.log(err)
    console.log(result, 'what can i fix')
    res.render('edit.ejs', {
      article: result,
      user: req.user
      //what information do you want to get from the DB to display on your browser?
    })
  })
});

/// save and post edit ////

app.post('/updateArticle', isLoggedIn, function(req, res) {
  let articleId = ObjectId(req.body.articleid)
  //think of it as issuing a database query
  db.collection('postyaemotions').findOneAndUpdate({
    _id: articleId
  }, {

    $set: {
      title: req.body.title,
      description: req.body.description,
      bpost: req.body.bpost
    }
  }, {
    upsert: false
  }, (err, result) => {
    if (err) return console.log(err)
    console.log(result, 'article updated!')
    res.redirect('/emotions')
    //what information do you want to get from the DB to display on your browser?
  })
});

///// delete button ////

app.get('/emotions/:id', (req, res) => {
  db.collection('postyaemotions').findOneAndDelete({
    _id: ObjectId(req.params.id),
  }, (err, result) => {
    console.log(result)
    if (err) return res.send(500, err)
    res.redirect('/emotions')
  })
})



// therapist directory ================================================================
app.get('/therapistdirectory', isLoggedIn, function(req, res) {
  db.collection('therapistdirectory').find().toArray((err, result) => {
    // it is going into the DB to find this info in the function below
    if (err) return console.log(err)

    res.render('therapistdirectory.ejs', {
      user: req.user,
      title: String,
      createdAt: new Date(),
      description: String,
      bpost: String,
    })
  })
});



// message board routes ===============================================================

app.post('/messages', (req, res) => {
  db.collection('messages').save({movie: req.body.movie, review: req.body.review}, (err, result) => {
    if (err) return console.log(err)
    console.log('saved to database')
    res.redirect('/doctor')
  })
})

    app.put('/messages', (req, res) => {
      
      db.collection('messages')
      .findOneAndUpdate({movie: req.body.movie},{
        $set: {
          review: req.body.review,
        }
      }, {
        sort: {_id: -1},
        // upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

   
    app.put('/messages1', (req, res) => {
      db.collection('messages')
      .findOneAndUpdate({name: req.body.name, msg: req.body.msg}, {
        $set: {
          thumbDown:req.body.thumbDown + 1,
          
        }
      }, {
        sort: {_id: -1},
        upsert: true
      }, (err, result) => {
        if (err) return res.send(err)
        res.send(result)
      })
    })

    app.delete('/messages', (req, res) => {
      db.collection('messages').findOneAndDelete({movie: req.body.movie, review: req.body.review}, (err, result) => {
        if (err) return res.send(500, err)
        res.send('Message deleted!')
      })
    })
// =============================================================================
// AUTHENTICATE (FIRST LOGIN) ==================================================
// =============================================================================

    // locally --------------------------------
        // LOGIN ===============================
        // show the login form
        app.get('/login', function(req, res) {
            res.render('login.ejs', { message: req.flash('loginMessage') });
        });

        // process the login form
        app.post('/login', passport.authenticate('local-login', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/login', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
        }));

        // SIGNUP =================================
        // show the signup form
        app.get('/signup', function(req, res) {
            res.render('signup.ejs', { message: req.flash('signupMessage') });
        });

        // process the signup form
        app.post('/signup', passport.authenticate('local-signup', {
            successRedirect : '/profile', // redirect to the secure profile section
            failureRedirect : '/signup', // redirect back to the signup page if there is an error
            failureFlash : true // allow flash messages
            
        }));

// =============================================================================
// UNLINK ACCOUNTS =============================================================
// =============================================================================
// used to unlink accounts. for social accounts, just remove the token
// for local account, remove email and password
// user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    app.get('/unlink/local', isLoggedIn, function(req, res) {
        var user            = req.user;
        user.local.email    = undefined;
        user.local.password = undefined;
        user.save(function(err) {
            res.redirect('/profile');
        });
    });

};

// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();

    res.redirect('/');
}
