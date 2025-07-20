// backend/controllers/feedbackController.js
const Feedback = require('../models/Feedback');
const nodemailer = require('nodemailer');

// Guardar un nuevo feedback que envía un usuario
exports.submitFeedback = async (req, res) => {
  const { type, message, page } = req.body;
  const userId = req.user.id;

  if (!type || !message || !page) {
    return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
  }

  try {
    const newFeedback = new Feedback({
      user: userId,
      type,
      message,
      page
    });

    await newFeedback.save();
    res.status(201).json({ message: '¡Gracias por tu feedback!' });

  } catch (error) {
    console.error("Error al guardar el feedback:", error);
    res.status(500).json({ message: 'Error interno al procesar tu solicitud.' });
  }
};

// Obtener todos los feedbacks para el panel de admin
exports.getFeedbacks = async (req, res) => {
    try {
        const feedbacks = await Feedback.find()
            .populate('user', 'name email')
            .sort({ createdAt: -1 });
        res.json(feedbacks);
    } catch (error) {
        console.error("Error al obtener los feedbacks:", error);
        res.status(500).json({ message: 'Error interno al obtener los feedbacks.' });
    }
};

exports.replyToFeedback = async (req, res) => {
    const { feedbackId } = req.params;
    const { replyMessage } = req.body;

    try {
        const feedback = await Feedback.findById(feedbackId).populate('user', 'name email');
        if (!feedback) {
            return res.status(404).json({ message: 'Feedback no encontrado.' });
        }
        if (!feedback.user) {
            return res.status(400).json({ message: 'El usuario original de este feedback ha sido eliminado.' });
        }

        // Configurar Nodemailer (igual que en authController)
        let transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465,
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        // Contenido del email de respuesta
        const mailOptions = {
            from: `"Equipo de OpoBoost" <${process.env.EMAIL_USER}>`,
            to: feedback.user.email,
            subject: `Re: Tu ${feedback.type} en OpoBoost`,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                    <h3>Hola ${feedback.user.name},</h3>
                    <p>Gracias por tu feedback. Hemos revisado tu ${feedback.type} y queríamos darte la siguiente respuesta:</p>
                    <div style="background-color: #f4f4f4; border-left: 4px solid #14B8A6; padding: 15px; margin: 20px 0;">
                        <p style="margin: 0;">${replyMessage}</p>
                    </div>
                    <p><b>Tu mensaje original era:</b></p>
                    <p><i>"${feedback.message}"</i></p>
                    <p>Apreciamos mucho tu ayuda para mejorar OpoBoost.</p>
                    <p>Un saludo,<br>El equipo de OpoBoost</p>
                </div>
            `
        };

        await transporter.sendMail(mailOptions);

        // Marcar como respondido y guardar la respuesta
        feedback.replied = true;
        feedback.replyText = replyMessage;
        await feedback.save();

        res.status(200).json({ message: 'Respuesta enviada correctamente.' });

    } catch (error) {
        console.error("Error al responder al feedback:", error);
        res.status(500).json({ message: 'Error interno al enviar la respuesta.' });
    }
};