const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('database.sqlite');
const crypto = require('crypto');

exports.getFilms = (req, res) => {
  db.all('SELECT * FROM films', (err, rows) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération des films' });
    } else {
      res.status(200).json(rows);
    }
  });
};




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

        if (row.actor_id) {
          film.actors.push({
            id: row.actor_id,
            first_name: row.first_name,
            last_name: row.last_name,
            date_of_birth: row.date_of_birth,
            date_of_death: row.date_of_death
          });
        }

        const etag = generateETag(film);
        res.setHeader('ETag', etag);
        res.status(200).json(film);
      }
    }
  );
};




exports.createFilm = (req, res) => {
  const { name, synopsis, release_year, genre_id, actors } = req.body;

  db.get('SELECT COUNT(*) AS count FROM genres WHERE id = ?', [genre_id], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la vérification de l\'existence du genre' });
    } else if (row.count === 0) {
      res.status(400).json({ error: 'Le genre spécifié n\'existe pas' });
    } else {
      db.run('INSERT INTO films (name, synopsis, release_year, genre_id) VALUES (?, ?, ?, ?)',
        [name, synopsis, release_year, genre_id],
        function (err) {
          if (err) {
            console.error(err);
            res.status(500).json({ error: 'Erreur lors de la création du film' });
          } else {
            const filmId = this.lastID;

            // Insert rows into films_actors table to associate actors with the film
            if (actors && actors.length > 0) {
              const values = actors.map(actorId => [filmId, actorId]);
              db.run('INSERT INTO films_actors (film_id, actor_id) VALUES (?, ?)', values, function (err) {
                if (err) {
                  console.error(err);
                  res.status(500).json({ error: 'Erreur lors de l\'association des acteurs avec le film' });
                } else {
                  res.status(201).json({ message: 'Film créé avec succès', id: filmId });
                }
              });
            } else {
              res.status(201).json({ message: 'Film créé avec succès', id: filmId });
            }
          }
        });
    }
  });
};


exports.updateFilm = (req, res) => {
  const filmId = req.params.id;
  const { name, synopsis, release_year, genre_id } = req.body;
  const receivedETag = req.headers['if-match'];

  db.get('SELECT * FROM films WHERE id = ?', [filmId], (err, row) => {
    if (err) {
      console.error(err);
      res.status(500).json({ error: 'Erreur lors de la récupération du film' });
    } else if (!row) {
      res.status(404).json({ error: 'Film non trouvé' });
    } else {
      const existingETag = generateETag(row);
      console.log(existingETag);
      if (receivedETag && receivedETag === existingETag) {
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




