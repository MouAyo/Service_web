
# Service Web

Groupe : Ayoub MOUADIL / Marouane MARHRANI


1) cd /racine_du_projet/
2) npm install
3) node server

● GET /actor : retourne la liste des acteurs
● GET /actor/{id} : retourne la fiche de l’acteur portant l’ID indiquée
● POST /actor : crée l’acteur selon les informations du corps de la requête
● PUT /actor/{id} : modifie l’acteur selon les informations du corps de la requête
● DELETE /actor/{id} : supprime l’acteur
● GET /genre : retourne la liste des genres
● POST /genre : crée le genre selon les informations du corps de la requête
● DELETE /genre/{id} : supprime le genre (sauf si utilisé dans un ou plusieurs
films)
● GET /film : retourne la liste des films, avec les informations de genre et les fiches
acteurs associées
● GET /film/{id} : retourne la fiche du film portant l’ID indiquée, avec les
informations de genre et les fiches acteurs associées
● POST /film : crée le film selon les informations du corps de la requête (erreur si
les acteurs et/ou le genre n’existent pas)
● PUT /film/{id} : modifie le film selon les informations du corps de la requête
(erreur si les acteurs et/ou le genre n’existent pas)
● DELETE /film/{id} : supprime le film


“http://localhost:8000/api/…”
