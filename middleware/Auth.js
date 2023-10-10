const isLogedout = (req, res, next) => {
    if (!req.session.user) {
       next()
    } else {
        res.redirect("/index")
    }
}

const isLogged = (req, res, next) => {
    if (req.session.user) {
        req.user = req.session.user
        next()
    } 
    else {
        res.redirect('/login')
    }
}

const loggedadmin = (req, res, next) => {
    if(req.session.admin){
        req.admin = req.session.user
        next()
    } 
    else {
        res.redirect('/admin/login')
    }
}

const logoutAdmin = (req, res, next) => {
    if(!req.session.admin){
        next()
    } else {
        res.redirect('/admin/dashboard')
    }
}
const logouting = (req,res,next) => {
    req.session.destroy()
    res.redirect('/login') 

    // dahsflklas.
    
    
    
}
const checkinguseroradmin = async (req,res,next) =>{
    if(req.session.admin){
        // req.admin = req.session.user
       return res.redirect("/admin/dashboard")
    }else if(req.session.user){
    //   return res.render('user/home')
      return res.redirect('/home')
    }else {
       res.redirect('/login')
    }

}


module.exports ={
    isLogedout,
    isLogged,
    logoutAdmin,
    loggedadmin,
    logouting,
    checkinguseroradmin,
   
    
}