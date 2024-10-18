const User = require("../../models/userSchema");
const bcrypt = require("bcrypt");

exports.loadAdminLogin = async (req, res) => {
  try {
    
    if (req.session.admin) {
      cosnole.log("admin login");
      res.redirect("/admin/dashboard", {
        layout: "layout/admin",
        title: "Dashboard",
      });
    } else {
      res.render("admin/adm-login", { layout: false });
    }
  } catch (err) {
    console.log(err);
  }
};

exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log(email, password);
    const admin = await User.findOne({ email: email, isAdmin: true });
    console.log(admin);
    if (!admin) {
      return res.json({ success: false });
    }
    if (admin) {
      const passwordMatch = bcrypt.compare(password, admin.password);
      if (!passwordMatch) {
        return res.json({ success: false });
      }
      req.session.admin = admin;
      res.json({ success: true });
    }
  } catch (error) {
    console.log("Login", error);
  }
};

exports.adminHome = async (req, res) => {
  try {
    res.render("admin/dashboard", {
      layout: "layout/admin",
      title: "Dashboard",
    });
  } catch (error) {
    console.log(error.message);
  }
};

exports.adminLogout = async (req, res) => {
    try {
      delete req.session.admin;
      res.send(); 
    } catch (err) {
      console.log("Unexpected error during logout:", err);
    }
  };
  