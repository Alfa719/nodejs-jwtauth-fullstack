import jwt from 'jsonwebtoken';
import Users from '../models/User.js';

class Middleware {
    static verifyTokenUser = (req, res, next) => {
        // Ambil data dari header authorization
        const header = req.headers['authorization'];
        // Jika token tidak ada kirim nilai null jika ada mirim token dengan split dari spasi
        const token = header && header.split(' ')[1];
        // Kalau token ga ada set authorize
        if (token === null) res.sendStatus(401);

        // kalau ada lakukan verifikasi token
        jwt.verify(token, process.env.JWT_SECRET_TOKEN, (err, user) => {
            // Kalau token tidak sama lakukan penolakan akses/forbidden
            if (err) res.sendStatus(403);
            // Kalau sama ambil email dari token dan bolehkan akses halaman
            req.email = user.email;
            next();
        });
    }
    static refreshTokenUser = async (req, res, next) => {
        try {
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
            // Kalau ada verifikasi refresh token
            jwt.verify(refreshToken, process.env.JWT_REFRESH_TOKEN, (err, user) => {
                if (err) res.sendStatus(403);
                const id = user.id;
                const name = user.name;
                const email = user.email;

                // Perbarui akses token
                const accessToken = jwt.sign({ id, name, email }, process.env.JWT_SECRET_TOKEN, {
                    expiresIn: '15s'
                });
                res.json({ accessToken });
            });
        } catch (error) {
            console.error(error);
        }
    }
}

export default Middleware;