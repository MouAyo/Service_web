const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');

// Récupérer la liste des genres
exports.getGenres = (req, res) => {
  // Logique pour récupérer la liste des genres depuis la base de données
  db.all('SELECT * FROM genres', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des genres' });
    } else {
      res.status(200).json(rows);
    }
  });
};

// Créer un nouveau genre
exports.createGenre = (req, res) => {
  const { name } = req.body;
  // Logique pour créer un nouveau genre dans la base de données
  db.run('INSERT INTO genres (name) VALUES (?)',
    [name],
    function (err) {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la création du genre' });
      } else {
        res.status(201).json({ message: 'Genre créé avec succès', id: this.lastID });
      }
    });
};

// Supprimer un genre

exports.deleteGenre = (req, res) => {
  const genreId = req.params.id;

  // Vérifier si le genre est utilisé dans un ou plusieurs films
  db.get('SELECT COUNT(*) AS count FROM films WHERE genre_id = ?', [genreId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la vérification des films associés au genre' });
    } else if (row.count > 0) {
      res.status(400).json({ error: 'Impossible de supprimer le genre car il est utilisé dans un ou plusieurs films' });
    } else {
      // Supprimer le genre s'il n'est pas utilisé dans les films
      db.run('DELETE FROM genres WHERE id = ?', [genreId], function (err) {
        if (err) {
          console.error(err);
          res.status(500).json({ error: 'Erreur lors de la suppression du genre' });
        } else if (this.changes === 0) {
          res.status(404).json({ error: 'Genre non trouvé' });
        } else {
          res.status(200).json({ message: 'Genre supprimé avec succès' });
        }
      });
    }
  });
};

