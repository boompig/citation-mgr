const { User } = require("./db-common");
const BCRYPT_SALT_ROUNDS = 10;
const bcrypt = require("bcrypt");

const Auth = module.exports;

exports.getUserByEmail = async (email) => {
    return User.where({email: email}).fetch();
};

/**
 * Return true or false depending on whether the user was authenticated
 */
exports.authUser = async (email, plaintextPassword) => {
    const user = await Auth.getUserByEmail(email);
    if (user) {
        if(user.get("hashed_password") === "") {
            // legacy case
            return true;
        }
        const equal = await bcrypt.compare(plaintextPassword, user.get("hashed_password"));
        return equal;
    } else {
        console.warn(`Tried to authenticate user with email ${email} but the user does not exist`);
        return false;
    }
};

/**
 * Delete the user with the given email
 */
exports.deleteUserByEmail = async (email) => {
    const user = await Auth.getUserByEmail(email);
    if (user) {
        await user.destroy();
        return true;
    } else {
        console.warn(`Tried to delete user with email ${email} but the user does not exist`);
        return false;
    }
};

/**
 * Create the account and return the resulting user object
 * This method will fail and return `null` if the user is a duplicate
 * @returns {User}
 */
exports.createUser = async (email, password, name) => {
    // NOTE: all accounts are created *without* admin flag
    // admin flag has to be added directly in the database
    const hashedPassword = await bcrypt.hash(password, BCRYPT_SALT_ROUNDS);
    const user = new User({
        email: email,
        hashed_password: hashedPassword,
        name: name,
        is_admin: false
    });
    try {
        await user.save();
        return user;
    } catch(e) {
        console.warn(`Failed to create a new user with email ${email} - user already exists`);
        console.error(e);
        return null;
    }
};
