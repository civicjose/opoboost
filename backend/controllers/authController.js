const jwt  = require('jsonwebtoken');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET || 'cambiame_por_un_secreto_seguro';

// Registro
exports.register = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email ya registrado' });
    const user = new User({ name, email, password, role: 'alumno', validated: false });
    await user.save();
    res.status(201).json({ message: 'Registrado. Pendiente de validación.' });
  } catch (err) {
    res.status(500).json({ message: 'Error en registro' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
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
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });
    res.json({ message: `Usuario ${user.email} validado` });
  } catch {
    res.status(500).json({ message: 'Error validando usuario' });
  }
};
