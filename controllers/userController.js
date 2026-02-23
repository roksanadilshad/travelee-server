const { getDB } = require("../config/db");
const bcrypt = require("bcrypt");

const getUser= async(req,res)=>{
    const db = getDB()
    const result = await db.collection("users").find().toArray();
    res.send(result)
}

const getSingleUser = async (req, res) => {
  try {
    const { email } = req.query;
    const db = getDB();

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const user = await db.collection("users").findOne({ email });

    
    return res.status(200).json({
      success: true,
      data: user || null,
    });

  } catch (err) {
    console.error("Get User Error:", err);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
const createNewUser = async (req, res) => {
      try {
    const { fullName, email, password, provider, image } = req.body;
         const db = getDB()
        //  Basic Validation
      
    if (!fullName || !email || !provider) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

        if (provider === "Credential") {
          if (password.length < 6 ) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
            
        }
    
    }

    // Check existing user
    const existingUser = await db.collection("users").findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "User already exists with this email",
      });
    }

        // Hash password
  let hashedPassword = null;
if (provider === "Credential") { 
  hashedPassword = await bcrypt.hash(password, 10);
}

        const userPassword = provider === "Credential" ? hashedPassword : null;

    //  Create user object
    const newUser = {
      fullName,
      email,
      image,
      provider,
      password: userPassword,
      createdAt: new Date(),
    };

    // Insert into DB
    const result = await db.collection("users").insertOne(newUser);

     res.status(201).json({
      success: true,
      message: "User registered successfully",
      userId: result.insertedId,
    });

  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
    
}

const ForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const db = getDB();
     if (!email) {
      return res.status(400).json({ success: false, message: "Email is required" });
    }

    const user = await db.collection("users").findOne({ email });
    
     if (!user) {
      return res.status(200).json({
        success: true,
        message: "If this email exists, a reset link has been sent",
      });
    }
    
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Internal Server Error",
      }),
      { status: 500 }
    );
  }
  
}


module.exports ={getUser, getSingleUser, createNewUser, ForgotPassword}