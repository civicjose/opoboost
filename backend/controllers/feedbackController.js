// backend/controllers/feedbackController.js
const Feedback = require('../models/Feedback');

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
            .populate('user', 'name email') // Traemos el nombre y email del usuario
            .sort({ createdAt: -1 }); // Los más nuevos primero
        res.json(feedbacks);
    } catch (error) {
        console.error("Error al obtener los feedbacks:", error);
        res.status(500).json({ message: 'Error interno al obtener los feedbacks.' });
    }
};