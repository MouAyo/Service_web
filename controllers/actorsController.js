const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

// Récupérer la liste des acteurs
exports.getActors = (req, res) => {
  // Logique pour récupérer la liste des acteurs depuis la base de données
  db.all('SELECT * FROM actors', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des acteurs' });
    } else {
      res.status(200).json(rows);
    }
  });
};

// Récupérer un acteur par son ID
exports.getActorById = (req, res) => {
  const actorId = req.params.id;
  // Logique pour récupérer un acteur par son ID depuis la base de données
  db.get('SELECT * FROM actors WHERE id = ?', [actorId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'acteur' });
    } else if (!row) {
      res.status(404).json({ error: 'Acteur non trouvé' });
    } else {
      res.status(200).json(row);
    }
  });
};

// Créer un nouvel acteur
exports.createActor = (req, res) => {
  const { first_name, last_name, date_of_birth, date_of_death } = req.body;
  // Logique pour créer un nouvel acteur dans la base de données
  db.run('INSERT INTO actors (first_name, last_name, date_of_birth, date_of_death) VALUES (?, ?, ?, ?)',
    [first_name, last_name, date_of_birth, date_of_death],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création de l\'acteur' });
      } else {
        res.status(201).json({ message: 'Acteur créé avec succès', id: this.lastID });
      }
    });
};

// Mettre à jour un acteur
exports.updateActor = (req, res) => {
  const actorId = req.params.id;
  const { first_name, last_name, date_of_birth, date_of_death } = req.body;
  // Logique pour mettre à jour un acteur dans la base de données
  db.run('UPDATE actors SET first_name = ?, last_name = ?, date_of_birth = ?, date_of_death = ? WHERE id = ?',
    [first_name, last_name, date_of_birth, date_of_death, actorId],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'acteur' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Acteur non trouvé' });
      } else {
        res.status(200).json({ message: 'Acteur mis à jour avec succès' });
      }
    });
};

// Supprimer un acteur
exports.deleteActor = (req, res) => {
  const actorId = req.params.id;
  // Logique pour supprimer un acteur de la base de données
  db.run('DELETE FROM actors WHERE id = ?', [actorId], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la suppression de l\'acteur' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Acteur non trouvé' });
    } else {
      res.status(200).json({ message: 'Acteur supprimé avec succès' });
    }
  });
};
