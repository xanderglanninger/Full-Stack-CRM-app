const mysql = require('mysql2');

//Query to fetch all technicians
var query = "SELECT * FROM technicians;";

// Create a MySQL connection with the database included
var con = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'ApexCare123',
    database: 'apexcare'
});

// Connect to the database
con.connect(function(err){
    if (err) {
        console.error('Error connecting: ' + err.stack);
        return;
    }
    console.log('Connected as id ' + con.threadId);

    //Run the query
    con.query(query, function(err, result){
        if (err) {
            console.error('Error executing query: ' + err.stack);
            return;
        }
        
        // Log the results of the query
        console.log("Technicians: ", result);
    });
});