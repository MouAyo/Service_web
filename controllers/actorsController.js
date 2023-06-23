const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const crypto = require('crypto');

// Récupérer la liste des acteurs
exports.getActors = (req, res) => {
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
    db.get('SELECT * FROM actors WHERE id = ?', [actorId], (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération de l\'acteur' });
      } else if (!row) {
        res.status(404).json({ error: 'Acteur non trouvé' });
      } else {
        const actor = row;
        const etag = generateETag(actor);
  
        res.setHeader('ETag', etag); 
        res.status(200).json(actor);
      }
    });
  };
  

// Créer un nouvel acteur
exports.createActor = (req, res) => {
  const { first_name, last_name, date_of_birth, date_of_death } = req.body;
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

exports.updateActor = (req, res) => {
  const actorId = req.params.id;
  const { first_name, last_name, date_of_birth, date_of_death } = req.body;
  const receivedETag = req.headers['if-match'];

  db.get('SELECT * FROM actors WHERE id = ?', [actorId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération de l\'acteur' });
    } else if (!row) {
      res.status(404).json({ error: 'Acteur non trouvé' });
    } else {
      const existingETag = generateETag(row);

      if ( receivedETag && receivedETag === existingETag ) {
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
      } else {
        // ETags don't match, send a 412 Precondition Failed response
        res.status(412).json({ error: 'Précondition échouée. L\'acteur a été modifié par un autre utilisateur.' });
      }
    }
  });
};

// Supprimer un acteur
exports.deleteActor = (req, res) => {
  const actorId = req.params.id;
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
function generateETag(actor) {
    const { id, name, age, gender } = actor;
    const data = `${id}-${name}-${age}-${gender}`;
    const hash = crypto.createHash('md5').update(data).digest('hex');
    return `"W/${hash}"`;
  }
