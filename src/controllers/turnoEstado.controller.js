import { TurnoEstado } from '../models/index.js';

export const getAllEstados = async (req, res) => {
  try {
    const estados = await TurnoEstado.findAll({
      order: [['id', 'ASC']]
    });

    if (!estados || estados.length === 0) {
      return res.status(404).json({ message: 'No se encontraron estados' });
    }
    
    res.json(estados);
  } catch (error) {
    console.error('Error obteniendo estados:', error);
    res.status(500).json({ message: 'Error obteniendo estados', error: error.message });
  }
};

export const getEstadoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const estado = await TurnoEstado.findByPk(id);
    
    if (!estado) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    
    res.json(estado);
  } catch (error) {
    console.error('Error obteniendo estado:', error);
    res.status(500).json({ message: 'Error obteniendo estado', error: error.message });
  }
};

export const getEstadoByNombre = async (req, res) => {
  try {
    const { nombre } = req.params;
    
    const estado = await TurnoEstado.findOne({
      where: { nombreEstado: nombre }
    });
    
    if (!estado) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    
    res.json(estado);
  } catch (error) {
    console.error('Error obteniendo estado por nombre:', error);
    res.status(500).json({ message: 'Error obteniendo estado', error: error.message });
  }
};

export const createEstado = async (req, res) => {
  try {
    const { nombreEstado } = req.body;
    
    if (!nombreEstado) {
      return res.status(400).json({ message: 'El nombre del estado es requerido' });
    }
    
    // Verificar que el estado no exista
    const estadoExistente = await TurnoEstado.findOne({
      where: { nombreEstado }
    });
    
    if (estadoExistente) {
      return res.status(400).json({ message: 'El estado ya existe' });
    }
    
    const nuevoEstado = await TurnoEstado.create({ nombreEstado });
    
    res.status(201).json(nuevoEstado);
  } catch (error) {
    console.error('Error creando estado:', error);
    res.status(500).json({ message: 'Error creando estado', error: error.message });
  }
};

export const updateEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombreEstado } = req.body;
    
    const estado = await TurnoEstado.findByPk(id);
    
    if (!estado) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    
    await estado.update({ nombreEstado });
    
    res.json(estado);
  } catch (error) {
    console.error('Error actualizando estado:', error);
    res.status(500).json({ message: 'Error actualizando estado', error: error.message });
  }
};

export const deleteEstado = async (req, res) => {
  try {
    const { id } = req.params;
    
    const estado = await TurnoEstado.findByPk(id);
    
    if (!estado) {
      return res.status(404).json({ message: 'Estado no encontrado' });
    }
    
    await estado.destroy();
    
    res.json({ message: 'Estado eliminado exitosamente' });
  } catch (error) {
    console.error('Error eliminando estado:', error);
    res.status(500).json({ message: 'Error eliminando estado', error: error.message });
  }
}; 