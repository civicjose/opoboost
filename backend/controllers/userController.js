// backend/controllers/userController.js
const User = require('../models/User');

// --- NUEVAS FUNCIONES ---

// Listar usuarios ya validados (activos)
exports.listActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ validated: true }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios activos' });
  }
};

// Listar usuarios pendientes de validación
exports.listPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ validated: false }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios pendientes' });
  }
};

// --- FUNCIONES EXISTENTES (SIN CAMBIOS) ---

// Cambiar rol de un usuario (solo ADMIN)
exports.updateUserRole = async (req, res) => {
  const { role } = req.body;
  if (!['alumno','profesor','administrador'].includes(role)) {
    return res.status(400).json({ message: 'Rol inválido' });
  }
  try {
    await User.findByIdAndUpdate(req.params.id, { role });
    res.json({ message: 'Rol actualizado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al actualizar rol' });
  }
};

// Borrar un usuario (solo ADMIN)
exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: 'Usuario eliminado' });
  } catch (err) {
    res.status(500).json({ message: 'Error al eliminar usuario' });
  }
};