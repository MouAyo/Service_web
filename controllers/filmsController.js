const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

// Récupérer la liste des films
exports.getFilms = (req, res) => {
  // Logique pour récupérer la liste des films depuis la base de données
  db.all('SELECT * FROM films', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des films' });
    } else {
      res.status(200).json(rows);
    }
  });
};

// Récupérer un film par son ID
exports.getFilmById = (req, res) => {
  const filmId = req.params.id;
  // Logique pour récupérer un film par son ID depuis la base de données
  db.get('SELECT * FROM films WHERE id = ?', [filmId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération du film' });
    } else if (!row) {
      res.status(404).json({ error: 'Film non trouvé' });
    } else {
      res.status(200).json(row);
    }
  });
};

// Créer un nouveau film
exports.createFilm = (req, res) => {
  const { name, synopsis, release_year, genre_id } = req.body;

  // Vérifier si le genre existe
  db.get('SELECT COUNT(*) AS count FROM genres WHERE id = ?', [genre_id], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la vérification de l existence du genre' });
    } else if (row.count === 0) {
      res.status(400).json({ error: 'Le genre spécifié n existe pas' });
    } else {
      // Créer le nouveau film dans la base de données
      db.run('INSERT INTO films (name, synopsis, release_year, genre_id) VALUES (?, ?, ?, ?)',
        [name, synopsis, release_year, genre_id],
        function (err) {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erreur lors de la création du film' });
          } else {
            res.status(201).json({ message: 'Film créé avec succès', id: this.lastID });
          }
        });
    }
  });
};


// Mettre à jour un film
exports.updateFilm = (req, res) => {
  const filmId = req.params.id;
  const { name, synopsis, release_year, genre_id } = req.body;
  // Logique pour mettre à jour un film dans la base de données
  db.run('UPDATE films SET name = ?, synopsis = ?, release_year = ?, genre_id = ? WHERE id = ?',
    [name, synopsis, release_year, genre_id, filmId],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la mise à jour du film' });
      } else if (this.changes === 0) {
        res.status(404).json({ error: 'Film non trouvé' });
      } else {
        res.status(200).json({ message: 'Film mis à jour avec succès' });
      }
    });
};

// Supprimer un film
exports.deleteFilm = (req, res) => {
  const filmId = req.params.id;
  // Logique pour supprimer un film de la base de données
  db.run('DELETE FROM films WHERE id = ?', [filmId], function (err) {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la suppression du film' });
    } else if (this.changes === 0) {
      res.status(404).json({ error: 'Film non trouvé' });
    } else {
      res.status(200).json({ message: 'Film supprimé avec succès' });
    }
  });
};
