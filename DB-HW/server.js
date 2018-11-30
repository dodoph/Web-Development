var path = require('path');
var express = require('express');
var handlebars = require('express-handlebars').create({defaultLayout:'main'});
var bodyParser = require('body-parser');
var mysql = require('./dbcon.js');
var helpers = require('handlebars-helpers')();
var app = express();

app.use(bodyParser.urlencoded({ extended: false }));


app.engine('handlebars', handlebars.engine);
app.set('view engine', 'handlebars');
app.set('port', 8765);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', function(req,res,next){

  
  // console.log('Starting to edit page');
  var context ={};

//edit page
  if(req.query['Edit']){
    console.log("we are editing");
    var context={};
    mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.query.id], function(err, rows, fields){
      if(err){
        next(err);
        return;
      }
    console.log("id is " + req.query.id);
    
    context.workouts = rows;

    if(rows[0].unit == "lbs"){
      console.log("this is lbs");
      context.unitSelected = true;
    }
    else{
      console.log("this is kg");
      context.unitSelected = false;
    }
    console.log("This is context ", context);
    res.render('edit', context);
    return;
    });
  }

  mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){

    if(err){
      console.log("error");
      next(err);
      return;
    }

    context.workouts = rows;
    console.log("RESULTS: " + context.workouts);
    res.render('home', context);
  });

});



app.post('/', function(req,res,next){
  console.log("This is post requst");
  var context = {};
  //first time submit
  if(req.body.Insert){
    mysql.pool.query("INSERT INTO workouts (`name`, `reps`, `weight`, `date`, `unit`) VALUES (?,?,?,?,?)", [req.body.name,req.body.reps,req.body.weight,req.body.date,req.body.unit], function(err, result){
      if(err){
        console.log("err");
        next(err);
        return;
      }
      console.log("Request: ", req.body);
      mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){

        if(err){
          console.log("error");
          next(err);
          return;
        }

        context.workouts = rows;
        console.log("RESULTS: " + context.workouts);
        res.render('home', context);

      });
      
    });
  }


  //Delete row
  else if(req.body.Delete){
    console.log("Starting to delete");
    mysql.pool.query("DELETE FROM workouts WHERE id=?", [req.body.id], function(err, result){
      if(err){
        next(err);
        return;
      }
      // res.redirect('/');
      
      mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){

        if(err){
          console.log("error");
          next(err);
          return;
        }

        context.workouts = rows;
        console.log("RESULTS: " + context.workouts);
        res.render('home', context);

      });

    });
  }

  // else if(req.body.Edit){
    
  //   console.log("we are editing");
  //   var context={};
  //   mysql.pool.query('SELECT * FROM workouts WHERE id=?', [req.body.id], function(err, rows, fields){
  //     if(err){
  //       next(err);
  //       return;
  //     }
  //   console.log("id is " + req.body.id);
    
  //   context.workouts = rows;

  //   if(rows[0].unit == "lbs"){
  //     console.log("this is lbs");
  //     context.unitSelected = true;
  //   }
  //   else{
  //     console.log("this is kg");
  //     context.unitSelected = false;
  //   }
  //   console.log("This is context ", context);
  //   res.render('edit', context);
  //   });
  
  // }

  else if(req.body.Update) {
    console.log("We are updating your page");
    mysql.pool.query("SELECT * FROM workouts WHERE id=?", [req.body.id], function(err, result){
      if(err){
        console.log(err);
        next(err);
        return;
      }
      console.log(req.body);
      console.log("hellow");
      console.log(result.length);
      
      if(result.length==1){
        console.log("hi");
        var curVals = result[0];
        mysql.pool.query("UPDATE workouts SET name=?, reps=?, weight=?, date=?, unit=? WHERE id=?",
          [req.body.name || curVals.body.name, req.body.reps || curVals.body.reps, req.body.weight || curVals.body.weight, req.body.date || curVals.body.date, req.body.unit || curVals.body.unit, req.body.id],
          function(err, result){
          if(err){
            next(err);
            return;
          }
          context.result = "Update " + result.changRows + " rows.";
          //res.redirect('/');
          mysql.pool.query('SELECT * FROM workouts', function(err, rows, fields){
            if(err){
              console.log("error");
              next(err);
              return;
            }

            context.workouts = rows;
            console.log("RESULTS: " + context.workouts);
            res.render('home', context);

          });
        });
      }
    });
  }

});



app.get('/reset-table',function(req,res,next){
  console.log("wuwu");
  var context = {};
  mysql.pool.query("DROP TABLE IF EXISTS workouts", function(err){
    var createString = "CREATE TABLE workouts(" +
    "id INT PRIMARY KEY AUTO_INCREMENT," +
    "name VARCHAR(255) NOT NULL," +
    "reps INT," +
    "weight INT," +
    "date DATE," +
    "unit BOOLEAN)";
    mysql.pool.query(createString, function(err){
      context.results = "Table reset";
      res.render('home',context);
      console.log("dwww");
      console.log(err);
    })
  });
});


app.use(function(req,res){ 
  res.status(404); 
  res.render('404'); 
}); 
 
app.use(function(err, req, res, next){ 
  console.error(err.stack); 
  res.type('plain/text'); 
  res.status(500); 
  res.render('500'); 
}); 

app.listen(app.get('port'), function(){
  console.log('Express started on http://localhost:' + app.get('port') + '; press Ctrl-C to terminate.');
});