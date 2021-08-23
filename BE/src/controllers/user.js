const UserModel = require("../models/UserModel");
const jwt = require("jsonwebtoken");

exports.login = (req, res) => {
    let user = await UserModel.findById(req.body);
    if (!user) return res.sendStatus(401);
    const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
    res.json({ accessToken });
}
exports.logout = (req, res) => {

}
exports.createUser = (req, res) => {
    let user = await UserModel.findOne({ google_id: req.body.google_id });
    if (user) {
        res.send(user);
    } else {
        let newUser = await new UserModel(req.body).save();
        res.send(newUser);
    }
}