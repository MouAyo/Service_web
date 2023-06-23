const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const crypto = require('crypto');

// Récupérer la liste des films
exports.getFilms = (req, res) => {
  db.all('SELECT films.*, genres.name AS genre_name, actors.* FROM films INNER JOIN genres ON films.genre_id = genres.id LEFT JOIN films_actors ON films.id = films_actors.film_id LEFT JOIN actors ON films_actors.actor_id = actors.id', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des films' });
    } else {
      // Group the rows by film ID to combine genre and actor information
      const films = rows.reduce((acc, row) => {
        const film = acc.find(f => f.id === row.id);
        if (film) {
          if (row.actor_id) {
            film.actors.push({
              id: row.actor_id,
              first_name: row.first_name,
              last_name: row.last_name,
              date_of_birth: row.date_of_birth,
              date_of_death: row.date_of_death
            });
          }
        } else {
          acc.push({
            id: row.id,
            name: row.name,
            synopsis: row.synopsis,
            release_year: row.release_year,
            genre_id: row.genre_id,
            genre_name: row.genre_name,
            actors: row.actor_id
              ? [
                  {
                    id: row.actor_id,
                    first_name: row.first_name,
                    last_name: row.last_name,
                    date_of_birth: row.date_of_birth,
                    date_of_death: row.date_of_death
                  }
                ]
              : []
          });
        }
        return acc;
      }, []);

      res.status(200).json(films);
    }
  });
};


// Récupérer un film par son ID
exports.getFilmById = (req, res) => {
  const filmId = req.params.id;
  db.get(
    'SELECT films.*, genres.name AS genre_name, actors.* FROM films INNER JOIN genres ON films.genre_id = genres.id LEFT JOIN films_actors ON films.id = films_actors.film_id LEFT JOIN actors ON films_actors.actor_id = actors.id WHERE films.id = ?',
    [filmId],
    (err, row) => {
      if (err) {
        console.error(err);
        res.status(500).json({ error: 'Erreur lors de la récupération du film' });
      } else if (!row) {
        res.status(404).json({ error: 'Film non trouvé' });
      } else {
        const film = {
          id: row.id,
          name: row.name,
          synopsis: row.synopsis,
          release_year: row.release_year,
          genre_id: row.genre_id,
          genre_name: row.genre_name,
          actors: []
        };

        // Add actor information to the film object
        if (row.actor_id) {
          film.actors.push({
            id: row.actor_id,
            first_name: row.first_name,
            last_name: row.last_name,
            date_of_birth: row.date_of_birth,
            date_of_death: row.date_of_death
          });
        }

        res.status(200).json(film);
      }
    }
  );
};



// Créer un nouveau film
exports.createFilm = (req, res) => {
  const { name, synopsis, release_year, genre_id } = req.body;

  // Vérifier si le genre existe
  db.get('SELECT COUNT(*) AS count FROM genres WHERE id = ?', [genre_id], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la vérification de l\'existence du genre' });
    } else if (row.count === 0) {
      res.status(400).json({ error: 'Le genre spécifié n\'existe pas' });
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
  const receivedETag = req.headers['if-match'];

  // Récupérer le film existant
  db.get('SELECT * FROM films WHERE id = ?', [filmId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération du film' });
    } else if (!row) {
      res.status(404).json({ error: 'Film non trouvé' });
    } else {
      const existingETag = generateETag(row);
      console.log(existingETag);
      // Comparer l'ETag reçu avec l'ETag du film existant
      if (receivedETag && receivedETag === existingETag) {
        // Les ETags correspondent, procéder à la mise à jour du film
        db.run(
          'UPDATE films SET name = ?, synopsis = ?, release_year = ?, genre_id = ? WHERE id = ?',
          [name, synopsis, release_year, genre_id, filmId],
          function (err) {
            if (err) {
              console.error(err);
              res.status(500).json({ error: 'Erreur lors de la mise à jour du film' });
            } else if (this.changes === 0) {
              res.status(404).json({ error: 'Film non trouvé' });
            } else {
              // Récupérer le film mis à jour
              db.get('SELECT * FROM films WHERE id = ?', [filmId], (err, updatedFilm) => {
                if (err) {
                  console.error(err);
                  res.status(500).json({ error: 'Erreur lors de la récupération du film mis à jour' });
                } else {
                  const updatedETag = generateETag(updatedFilm);
                  res.status(200).header('ETag', updatedETag).json({ message: 'Film mis à jour avec succès' });
                }
              });
            }
          }
        );
      } else {
        // Les ETags ne correspondent pas, renvoyer une réponse 412 Precondition Failed
        res.status(412).json({ error: 'Précondition échouée. Le film a été modifié par un autre utilisateur.' });
      }
    }
  });
};


// Supprimer un film
exports.deleteFilm = (req, res) => {
  const filmId = req.params.id;
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
function generateETag(film) {
  const { id, name, synopsis, release_year, genre_id } = film;
  const data = `${id}-${name}-${synopsis}-${release_year}-${genre_id}`;
  const hash = crypto.createHash('md5').update(data).digest('hex');
  return `"W/${hash}"`;
}




