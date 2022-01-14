import Users from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

class UserController {
    static register = async (req, res) => {
        const { name, email, password, confirmPassword } = req.body;
        // Bad request ketika password dan confirm tidak sama
        if (password !== confirmPassword) res.status(400).json({ msg: "Password and confirm password doesn't match!" });

        const salt = await bcrypt.genSalt();
        const hashPassword = await bcrypt.hash(password, salt);

        try {
            await Users.create({
                name: name,
                email: email,
                password: hashPassword
            });
            res.status(201).json({
                msg: "Success registered",
                data: {
                    name: name,
                    email:email
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
    static login = async (req, res) => {
        try {
            const user = await Users.findOne({
                where: {
                    email: req.body.email
                }
            });
            const matchPassword = await bcrypt.compare(req.body.password, user.password);
            if (!matchPassword) res.status(400).json({ msg: "Wrong Password!" });
            // res.json([user.id, user.email, user.name]);
            const id = user.id;
            const email = user.email;
            const name = user.name;
            // Generate token dan refresh token
            const accessToken = await jwt.sign({ id, name, email }, process.env.JWT_SECRET_TOKEN, {
                expiresIn: '20s'
            });
            const refreshToken = await jwt.sign({ id, name, email }, process.env.JWT_REFRESH_TOKEN, {
                expiresIn: '1d'
            });
            await user.update({ refresh_token: refreshToken });
            res.cookie('refreshToken', refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000
            });
            res.json({ accessToken });
        } catch (error) {
            // res.status(404).json({ msg: "Email not found!" });
            console.error(error.stack);
        }
    }
    static index = async (req, res) => {
        try {
            const users = await Users.findAll({
                attributes: ['id', 'name', 'email']
            });
            res.json(users);
        } catch (error) {
            console.error(error);
        }
    }
    static logout = async (req, res) => {
        // Ambil refresh token yang dikirim oleh controller ketika login
        const refreshToken = req.cookies.refreshToken;
        // Kalau ga ada refresh token buat authorize
        if (!refreshToken) res.sendStatus(401);
        // Cari dari user yang memiliki akses refresh token yang sama
        const user = await Users.findOne({
            where: {
                refresh_token: refreshToken
            }
        });
        // Kalau ga ada buat aksen halaman dilarang
        if (!user) res.sendStatus(403);
        // Kalau ada kosongkan refresh token nya
        await user.update({ refresh_token: null });
        // Bersihkan cookie nya
        res.clearCookie('refreshToken');
        return res.sendStatus(200);
    }
}

export default UserController;