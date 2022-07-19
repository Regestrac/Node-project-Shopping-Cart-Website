/* Connecing to the Database */
const mongoClient = require('mongodb').MongoClient
const state= {
    db:null
}
module.exports.connect= function(done) {
    const url='mongodb://localhost:27017'       //url to connect
    const dbname='shopping'                     //Name for the database

    mongoClient.connect(url,(err,data) => {
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}
module.exports.get=function() {         //get() will return the connection status of database
    return state.db
}