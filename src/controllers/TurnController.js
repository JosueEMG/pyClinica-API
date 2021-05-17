const { request } = require("express");
const Doctor = require("../models/Doctor");
const Turn = require("../models/Turn");
const mongoose = require("mongoose");
const TurnController = {};

// listar turnos
TurnController.listTurn = async (req, res) => {
  const turnFound = await Turn.find();
  res.json(turnFound);
};

//insertar turno
TurnController.insertTurn = async (req, res) => {
  const idDoctor = req.params.doctorid;
  const { type, start_time, end_time, schedules } = req.body;

  const turnSchema = new Turn({
    type,
    start_time,
    end_time,
    schedules,
  });
  try {
    const turnCreate = await turnSchema.save();
    const doctorUpdated = await Doctor.findByIdAndUpdate(
      idDoctor,
      {
        $addToSet: {
          turn: turnCreate._id,
        },
      },
      {
        new: true,
      }
    );
    //res.json({ turnCreate, doctorUpdated });
    res.status(201).json({
      message: "Turno registrado correctamente",
    });
  } catch (error) {
    console.log(error);
  }
};

//eliminar turno
TurnController.deleteTurn = async (req, res) => {
  const idTurn = req.params.turnid;
  try {
    await Doctor.findOneAndUpdate(
      { turn: idTurn },
      {
        $pull: {
          turn: idTurn,
        },
      }
    );
    const deleteFound = await Turn.findByIdAndDelete(idTurn);
    //res.json(deleteFound);
    res.status(201).json({
      message: "Turno eliminado correctamente",
    });
  } catch (error) {
    console.log(error);
  }
};

// actualizar turno
TurnController.updateTurn = async (req, res) => {
  const idTurn = req.params.turnid;
  const turnSchema = new Turn({
    type: req.body.type,
    start_time: req.body.start_time,
    end_time: req.body.end_time,
    schedules: req.body.schedules,
  });

  try {
    const updateFound = await Turn.findOneAndUpdate(
      { _id: idTurn },
      { $set: req.body },
      { new: true }
    );
    // res.json();
    res.status(201).json({
      message: "Turno actualizado correctamente",
      //updateFound
    });
  } catch (error) {
    console.log(error);
  }
};

// Listar horarios de un turno
TurnController.ListOnlySchedules = async (req, res) => {
  const idTurn = req.params.turnid;
  const listSchedule = await Turn.findById(idTurn).populate("schedules");

  res.json(listSchedule);
};

// Listar horarios por Doctor
TurnController.listSchedulesIdDoctor = async (req, res) => {
  const { iddoctor } = req.params;

  const doctorFound = await Doctor.aggregate([
    {
      $match: {
        _id: mongoose.Types.ObjectId(iddoctor),
      },
    },
    {
      $lookup: {
        from: "turns",
        localField: "turn",
        foreignField: "_id",
        as: "turn",
      },
    },
    {
      $unwind: "$turn",
    },
    {
      $lookup: {
        from: "schedules",
        localField: "turn.schedules",
        foreignField: "_id",
        as: "schedules",
      },
    },
    {
      $unwind: "$schedules",
    },
    {
      $project: {
        _id: "$schedules._id",
        doctor: "$name",
        turn: "$turn.type",
        schedule: "$schedules.scheduletime",
      },
    },
  ]);

  res.status(201).json({
    message: "Horarios del doctor encontrados correctamente",
    doctorFound,
  });
};

module.exports = TurnController;
