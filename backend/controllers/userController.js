// backend/controllers/userController.js
const User = require('../models/User');
const mongoose = require('mongoose');

exports.listActiveUsers = async (req, res) => {
  try {
    const users = await User.find({ validated: true }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios activos' });
  }
};

exports.listPendingUsers = async (req, res) => {
  try {
    const users = await User.find({ validated: false }).select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Error al obtener usuarios pendientes' });
  }
};

// --- FUNCIÓN CORREGIDA ---
// Obtener los permisos de un usuario específico
exports.getUserPermissions = async (req, res) => {
  try {
    // 1. Buscamos el documento completo, sin .lean()
    const user = await User.findById(req.params.id).select('accessibleCategories');
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    // 2. Antes de enviar, convertimos los ObjectIds a strings.
    // Esto es crucial para que la lógica de los checkboxes en React (`includes()`) funcione correctamente.
    const permissionIdsAsString = user.accessibleCategories ? user.accessibleCategories.map(id => id.toString()) : [];
    res.json(permissionIdsAsString);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo permisos' });
  }
};

// --- (updateUserPermissions se mantiene igual, ya que el guardado funciona bien) ---
exports.updateUserPermissions = async (req, res) => {
  const { categoryIds } = req.body;
  
  if (!Array.isArray(categoryIds)) {
    return res.status(400).json({ message: 'El formato de los datos es incorrecto.' });
  }
  
  try {
    // 1. Buscamos al usuario que vamos a modificar
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado.' });
    }

    // 2. Convertimos los IDs de string a ObjectId
    user.accessibleCategories = categoryIds.map(id => new mongoose.Types.ObjectId(id));

    // 3. Guardamos el documento completo. Este método es el más fiable.
    await user.save();
    
    res.json({ message: 'Permisos actualizados correctamente.' });

  } catch (err) {
    console.error("Error al actualizar permisos:", err.message);
    res.status(500).json({ message: 'Error interno al actualizar permisos.' });
  }
};


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

exports.deleteUser = async (req, res) => {
    try {
      await User.findByIdAndDelete(req.params.id);
      res.json({ message: 'Usuario eliminado' });
    } catch (err) {
      res.status(500).json({ message: 'Error al eliminar usuario' });
    }
};

exports.getMyPermissions = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('accessibleCategories').lean();
    if (!user) {
      return res.status(404).json({ message: 'Usuario no encontrado' });
    }
    const permissionIdsAsString = (user.accessibleCategories || []).map(id => id.toString());
    res.json(permissionIdsAsString);
  } catch (err) {
    res.status(500).json({ message: 'Error obteniendo tus permisos' });
  }
};
