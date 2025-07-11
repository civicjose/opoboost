// backend/controllers/userController.js
const User = require('../models/User');

// Listar todos los usuarios (solo ADMIN)
exports.listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios' });
  }
};

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
