const UserModel = require("../models/user.model");

exports.getUser = async (args) => {
    if (!args.user) return null;
    return await UserModel.findById(args.user);
}
exports.updateUser = async (args) => {
    const query = { user_name: args.user_name }
    return await UserModel.findOneAndUpdate(query, args);
}
exports.getUsers = async (args) => {
    return await UserModel.find(args);
}
exports.signIn = async (args) => {
    let user = await UserModel.findOne(args);
    if (!user) return null;
    return user;
}
exports.signUp = async (args) => {
    let user = await UserModel.findOne(args);
    if (!user) user = await new UserModel(args).save();
    return user;
}