const jwt = require('jsonwebtoken');
const nodeCrypto = require('crypto'); // Asegúrate de que se llama 'nodeCrypto'
const User = require('../models/User');
const nodemailer = require('nodemailer');
const JWT_SECRET = process.env.JWT_SECRET;

// Registro
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) {
      return res.status(400).json({ message: 'Email ya registrado' });
    }
    
    const user = new User({ name, email, password, role: 'alumno', validated: false });
    await user.save();

    // --- LÓGICA PARA ENVIAR EL CORREO DE BIENVENIDA ---
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
            from: `"Equipo de OpoBoost" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '¡Bienvenido/a a OpoBoost!',
            html: generateWelcomeEmailHTML(user.name)
        };
        
        await transporter.sendMail(mailOptions);
    } catch (emailError) {
        // Si el envío de email falla, no bloqueamos el registro.
        // Simplemente lo registramos en la consola del servidor.
        console.error("Error al enviar el email de bienvenida:", emailError);
    }
    // ----------------------------------------------------

    res.status(201).json({ message: 'Registrado. Pendiente de validación.' });
  } catch (err) {
    res.status(500).json({ message: 'Error en registro' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(400).json({ message: 'Credenciales inválidas' });
    if (!user.validated) {
      return res.status(403).json({ message: 'Tu cuenta está a la espera de validación' });
    }
    const ok = await user.checkPassword(password);
    if (!ok) return res.status(400).json({ message: 'Credenciales inválidas' });
    const token = jwt.sign({ id: user._id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });
    res.json({ token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch {
    res.status(500).json({ message: 'Error en login' });
  }
};

// Validar usuario (solo Admin)
exports.validateUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByIdAndUpdate(id, { validated: true }, { new: true });
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }

    // --- LÓGICA PARA ENVIAR EL CORREO DE VALIDACIÓN ---
    try {
        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465,
            auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
        });

        const mailOptions = {
            from: `"Equipo de OpoBoost" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: '¡Tu cuenta en OpoBoost ha sido activada!',
            html: generateAccountValidatedEmailHTML(user.name)
        };
        
        await transporter.sendMail(mailOptions);
    } catch (emailError) {
        // Si el envío de email falla, no bloqueamos la validación.
        console.error("Error al enviar el email de validación de cuenta:", emailError);
    }
    // ----------------------------------------------------

    res.json({ message: `Usuario ${user.email} validado` });
  } catch(err) {
    console.error(err);
    res.status(500).json({ message: 'Error validando usuario' });
  }
};

const generatePasswordResetEmailHTML = (resetUrl) => {
    // ¡IMPORTANTE! Reemplaza esta URL con la URL de tu logo PNG subido.
    const logoUrl = 'https://opoboost.com/og-image.png';

    return `
        <body style="background-color: #f4f4f4; margin: 0; padding: 0; font-family: Arial, sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 20px 0;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <tr>
                                <td align="center" style="padding: 40px 0 30px 0; border-bottom: 1px solid #eeeeee;">
                                    
                                    <img src="${logoUrl}" alt="OpoBoost Logo" width="100" height="100" style="display: block;" />
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; margin-top: 0;">Restablecimiento de Contraseña</h2>
                                    <p style="color: #555555;">Hola,</p>
                                    <p style="color: #555555;">Hemos recibido una solicitud para restablecer la contraseña de tu cuenta. Puedes hacerlo haciendo clic en el siguiente botón:</p>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center" style="padding: 20px 0;">
                                                <a href="${resetUrl}" style="background-color: #14B8A6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Establecer Nueva Contraseña</a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="color: #555555;">Si no has solicitado este cambio, puedes ignorar este correo de forma segura. Este enlace expirará en 1 hora.</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 20px 30px; background-color: #f8f8f8; border-top: 1px solid #eeeeee; border-radius: 0 0 8px 8px;">
                                    <p style="color: #777777; font-size: 0.8em; margin: 0;">&copy; ${new Date().getFullYear()} OpoBoost. Todos los derechos reservados.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    `;
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(200).json({ message: 'Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.' });
    }

    if (user.resetPasswordToken && user.resetPasswordExpires) {
      const timeRemaining = user.resetPasswordExpires.getTime() - Date.now();
      
      if (timeRemaining > 3000000) { 
        return res.status(429).json({ message: 'Ya se ha enviado un enlace de recuperación. Por favor, espera unos minutos antes de volver a intentarlo.' });
      }
    }

    const resetToken = nodeCrypto.randomBytes(20).toString('hex');
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hora
    await user.save();

    //const resetUrl = `http://localhost:5173/reset-password/${resetToken}`;
    const resetUrl = `https://opoboost.com/reset-password/${resetToken}`;

    let transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT,
        secure: process.env.EMAIL_PORT == 465,
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    });

    const mailOptions = {
        from: `"OpoBoost" <${process.env.EMAIL_USER}>`,
        to: user.email,
        subject: 'Restablecimiento de contraseña para OpoBoost.com',
        html: generatePasswordResetEmailHTML(resetUrl) // <-- USAMOS LA NUEVA FUNCIÓN
    };

    await transporter.sendMail(mailOptions);
    
    res.status(200).json({ message: 'Si tu email está registrado, recibirás un enlace para restablecer tu contraseña.' });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al enviar el correo. Revisa la configuración.' });
  }
};


exports.resetPassword = async (req, res) => {
  const { password } = req.body;
  try {
    // Buscar usuario por el token y verificar que no ha expirado
    const user = await User.findOne({
      resetPasswordToken: req.params.token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'El token para restablecer la contraseña es inválido o ha expirado.' });
    }

    // Establecer la nueva contraseña y limpiar los campos del token
    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Contraseña actualizada correctamente.' });

  } catch (err) {
    res.status(500).json({ message: 'Error al restablecer la contraseña.' });
  }
};

const generateWelcomeEmailHTML = (userName) => {
    const logoUrl = 'https://opoboost.com/og-image.png';
    return `
        <body style="background-color: #f4f4f4; margin: 0; padding: 0; font-family: Arial, sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 20px 0;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <tr>
                                <td align="center" style="padding: 40px 0 30px 0; border-bottom: 1px solid #eeeeee;">
                                    <img src="${logoUrl}" alt="OpoBoost Logo" width="100" height="100" style="display: block;" />
                                    <div style="color: #1E3A8A; font-size: 24px; font-weight: bold; margin-top: 10px;">¡Bienvenido a OpoBoost!</div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; margin-top: 0;">¡Hola, ${userName}!</h2>
                                    <p style="color: #555555;">Gracias por registrarte en OpoBoost, la plataforma definitiva para preparar tus oposiciones.</p>
                                    <p style="color: #555555; font-weight: bold;">Tu cuenta ha sido creada y está pendiente de validación por parte de un administrador. Recibirás una notificación tan pronto como sea activada.</p>
                                    <p style="color: #555555;">Una vez validada, podrás acceder a todos los tests, simulacros y seguir tu progreso para alcanzar tu plaza.</p>
                                    <p style="color: #555555;">¡Estamos muy contentos de tenerte con nosotros!</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 20px 30px; background-color: #f8f8f8; border-top: 1px solid #eeeeee; border-radius: 0 0 8px 8px;">
                                    <p style="color: #777777; font-size: 0.8em; margin: 0;">&copy; ${new Date().getFullYear()} OpoBoost. Todos los derechos reservados.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    `;
};

const generateAccountValidatedEmailHTML = (userName) => {
    const logoUrl = 'https://opoboost.com/og-image.png';
    //const loginUrl = 'http://localhost:5173/login';
    const loginUrl = 'https://opoboost.com/';

    return `
        <body style="background-color: #f4f4f4; margin: 0; padding: 0; font-family: Arial, sans-serif;">
            <table border="0" cellpadding="0" cellspacing="0" width="100%">
                <tr>
                    <td style="padding: 20px 0;">
                        <table align="center" border="0" cellpadding="0" cellspacing="0" width="600" style="border-collapse: collapse; background-color: #ffffff; border-radius: 8px; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
                            <tr>
                                <td align="center" style="padding: 40px 0 30px 0; border-bottom: 1px solid #eeeeee;">
                                    <img src="${logoUrl}" alt="OpoBoost Logo" width="100" height="100" style="display: block;" />
                                    <div style="color: #1E3A8A; font-size: 24px; font-weight: bold; margin-top: 10px;">¡Tu cuenta ha sido activada!</div>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 40px 30px;">
                                    <h2 style="color: #333333; margin-top: 0;">¡Hola de nuevo, ${userName}!</h2>
                                    <p style="color: #555555;">Tenemos buenas noticias. Tu cuenta en OpoBoost ha sido validada por un administrador.</p>
                                    <p style="color: #555555; font-weight: bold;">¡Ya puedes acceder a la plataforma y empezar a prepararte!</p>
                                    <table border="0" cellpadding="0" cellspacing="0" width="100%">
                                        <tr>
                                            <td align="center" style="padding: 20px 0;">
                                                <a href="${loginUrl}" style="background-color: #14B8A6; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Entrar a OpoBoost</a>
                                            </td>
                                        </tr>
                                    </table>
                                    <p style="color: #555555;">Te deseamos mucho éxito en tu preparación.</p>
                                </td>
                            </tr>
                            <tr>
                                <td align="center" style="padding: 20px 30px; background-color: #f8f8f8; border-top: 1px solid #eeeeee; border-radius: 0 0 8px 8px;">
                                    <p style="color: #777777; font-size: 0.8em; margin: 0;">&copy; ${new Date().getFullYear()} OpoBoost. Todos los derechos reservados.</p>
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
    `;
};
