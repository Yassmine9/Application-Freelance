Documentation Technique FreelanceHub

1. Présentation du projet

FreelanceHub est une plateforme de mise en relation entre clients et freelances.

Le projet est organisé sous forme de monorepo, contenant à la fois :
- un frontend Ionic + Angular dans appFreelance/
- un backend Flask + MongoDB dans backend/

La plateforme permet notamment :
- l’authentification sécurisée avec JWT
- la gestion des rôles :
  - Client
  - Freelancer
  - Administrateur
- la publication d’offres et de services
- l’envoi de propositions
- la gestion des commandes
- la messagerie en temps réel
- les avis et évaluations
- l’administration de la plateforme


2. Architecture du système

Frontend

Le frontend est développé avec :
- Ionic
- Angular

Il communique avec le backend via des appels HTTP REST grâce à HttpClient.

Dossier principal :
appFreelance/


Backend

Le backend est développé avec :
- Flask
- MongoDB

L’API est organisée par domaines fonctionnels :
- Authentification
- Gigs / Services
- Offres
- Propositions
- Commandes
- Messagerie
- Avis
- Administration

Dossier principal :
backend/


Base de données

Le projet utilise MongoDB, une base de données orientée documents.

Les données sont stockées dans différentes collections selon les fonctionnalités de la plateforme.


Communication temps réel

La messagerie instantanée utilise :
- Socket.IO


Gestion des fichiers

Les fichiers uploadés par les utilisateurs sont stockés dans :
backend/uploads/

Exemples :
- CV
- photos de profil
- cahiers des charges
- cover letters
- produits


3. Installation et exécution

Prérequis

Avant de lancer le projet, installer :
- Node.js 20+
- npm
- Python 3.10+
- MongoDB


4. Configuration du Backend (Flask)

Se placer dans le dossier :
backend/

Installation des dépendances :
pip install -r requirements.txt

Configuration des variables d’environnement :

MONGO_URI=""
MONGO_DB=freelancehub_db

Lancement du serveur Flask :
python app.py

Le backend sera disponible sur :
http://localhost:5000


5. Configuration du Frontend (Ionic)

Se placer dans :
appFreelance/

Installation des dépendances :
npm install

Lancement de l’application :
npm start

Configuration de l’URL de l’API :

appFreelance/src/environments/environment.ts
appFreelance/src/environments/environment.prod.ts


6. API REST

Toutes les routes utilisent la base :
/api


7. Authentification et profils

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/register | Inscription utilisateur |
| POST | /api/login | Connexion utilisateur |
| GET | /api/profile | Profil connecté |
| GET | /api/auth/profile/<user_id> | Profil d’un utilisateur |


8. Administration

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/admin/pending | Comptes en attente |
| PATCH | /api/admin/approve/<user_id> | Validation d’un compte |
| PATCH | /api/admin/reject/<user_id> | Rejet d’un compte |
| GET | /api/admin/stats | Statistics |
| PATCH | /api/admin/<gig_id>/reject | Rejeter un gig |
| PATCH | /api/admin/<offer_id>/approve | Valider une offre |
| PATCH | /api/admin/<offer_id>/reject | Rejeter une offre |


9. Gigs / Services

| Méthode | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/gigs | Liste des gigs |
| POST | /api/gigs | Création d’un gig |
| PATCH | /api/gigs/<gig_id> | Modification d’un gig |


10. Catégories

| Méthode | Endpoint |
|--------|----------|
| GET | /api/categories/ |


11. Offres et propositions

Offres

- POST /api/offers
- GET /api/offers
- GET /api/offers/<offer_id>
- GET /api/offers/my/offers
- GET /api/offers/by-freelancer/<freelancer_id>
- GET /api/offers/my/jobs


Propositions

- POST /api/proposals/
- GET /api/proposals/<offer_id>
- PUT /api/proposals/<proposal_id>/accept
- PUT /api/proposals/<proposal_id>/reject
- GET /api/proposals/my/proposals


12. Gestion des commandes (Gig Orders)

- POST /api/gigorders
- PATCH /api/gigorders/<order_id>/accept
- PATCH /api/gigorders/<order_id>/deliver
- PATCH /api/gigorders/<order_id>/complete
- PATCH /api/gigorders/<order_id>/revision
- PATCH /api/gigorders/<order_id>/cancel
- GET /api/client/gigorders
- GET /api/freelancer/gigorders
- GET /api/gigorders/<order_id>


13. Avis et évaluations

- GET /api/reviews/freelancer/<freelancer_id>
- GET /api/reviews/can-review/<freelancer_id>
- POST /api/reviews
- PATCH /api/reviews/<review_id>/reply
- PATCH /api/reviews/<review_id>/hide


14. Messagerie

- GET /api/messages/<offer_id>
- POST /api/messages/
- GET /api/messages/conversations

La communication en temps réel est gérée avec Socket.IO.


15. Store / Produits

- GET /api/products
- GET /api/products/<product_id>
- GET /api/download/<product_id>
- POST /api/products/purchase


16. Base de données

Collections principales :
- client
- freelancer
- admin
- gig
- gig_order
- offers
- proposals
- review
- messages
- categories
- products


Statuts importants :

Offres :
open | in_progress | closed

Propositions :
pending | accepted | rejected

Commandes :
pending | in_progress | delivered | completed | cancelled

Avis :
visible | hidden


## Architecture de projet FreelanceHub

```text
backend/
├── routes/
│   ├── admin_routes.py
│   ├── admin_review_routes.py
│   ├── auth.py
│   ├── category_routes.py
│   ├── client_routes.py
│   ├── freelancer_routes.py
│   ├── gig_order_routes.py
│   ├── gig_routes.py
│   ├── messages.py
│   ├── offers.py
│   ├── product_routes.py
│   ├── proposals.py
│   ├── review_routes.py
│   └── store_routes.py
│
├── services/
│   ├── freelancer_service.py
│   ├── gig_order_service.py
│   ├── gig_service.py
│   └── review_service.py
│
├── models/
│   ├── __init__.py
│   ├── admin.py
│   ├── admin_stat.py
│   ├── base_user.py
│   ├── category.py
│   ├── client.py
│   ├── freelancer.py
│   ├── gig.py
│   ├── gig_order.py
│   ├── product.py
│   ├── proposal.py
│   ├── purchase.py
│   ├── report.py
│   └── review.py
│
├── uploads/
├── utils/
├── app/
├── db/
├── .env
├── app.py
├── config.py
└── cleanup_collections.py

appFreelance/
└── src/
    └── app/
        ├── services/
        ├── pages/
        ├── components/
        ├── guards/
        ├── home/
        └── interceptors/
```
18. Conclusion

FreelanceHub repose sur une architecture moderne combinant :
- Ionic + Angular pour le frontend
- Flask pour le backend
- MongoDB pour la persistance des données
- Socket.IO pour la communication temps réel

L’application est organisée de manière modulaire afin de faciliter :
- la maintenance
- l’évolution des fonctionnalités
- la collaboration entre développeurs
