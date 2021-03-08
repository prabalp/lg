const mysql = require("mysql");
const jwt = require('jsonwebtoken')
const bcrypt= require('bcryptjs')

const db = mysql.createConnection({
    host:     process.env.DATABASE_HOST,
    user:     process.env.DATABASE_USER,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE
});

exports.register =(req, res)=>{
    console.log(req.body);
    

    const {name, email, password, passwordc} = req.body;

    db.query('SELECT email FROM users WHERE email=?', [email], async (error, results)=>{
        if(error){
            console.log(error);
        }
        if(results.length>0){
            return res.render('register',{
                message:"That email has been taken "
            })
        }else if(password != passwordc){
            return res.render('register',{
                message:"password do not match "
            })
        }

        let hashedPass = await bcrypt.hash(password, 8);
        console.log(hashedPass)

        db.query('INSERT INTO users SET ?', {Name:name, Email: email , Password:hashedPass}, (error, results)=>{
            if(error){
                console.log(error);
            }else{
                return res.render('register',{
                    message:"user register"
                })
            }
        })
    })

    
}

exports.login = async (req, res)=>{
    try{
        const {email, password}= req.body
        if(!email || !password){
            return res.status(404).render('login', {
                message:"please provide a email and password"
            })
        }
        console.log('pass')
        db.query('SELECT * FROM users WHERE email=?', [email], async(error, results)=>{
            console.log(results)
            if(results == [] || !(await bcrypt.compare(password, results[0].Password))){
                res.status(401).render('login', {
                    message:"Email or Password is incorect"
                })
            }else{
                const id = results[0].Id;

                const token = jwt.sign({Id: id}, process.env.JWT_SECRET,{
                    expiresIn: process.env.COOK_EXP
                });

                console.log('The token is'+token);

                const cookOption={
                    expires: new Date(
                        Date.now() + process.env.JWT_COOKIE_EXPIRES*24*60*60
                    ),
                    httpOnly: true
                }

                res.cookie('jwt', token, cookOption);
                res.status(200).redirect("/")

            }
        })
    }catch(error){
        console.log(error);
    }

}