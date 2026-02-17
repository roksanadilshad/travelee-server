const { getDB } = require("../config/db");

const getUser= async(req,res)=>{
    const db = getDB()
    const result = await db.collection("users").find({role: "citizen"}).toArray();
    res.send(result)
}

module.exports ={getUser}