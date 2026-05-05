# Documentation Technique - FreelanceHub

## 1) Vue d'ensemble
FreelanceHub est un monorepo compose de:
- Frontend mobile/web Ionic + Angular dans appFreelance/
- Backend API Flask + MongoDB dans backend/

Le systeme fournit: authentification JWT, roles (client, freelancer, admin), offres/propositions, gigs/commandes, messagerie, avis, et gestion admin.

## 2) Architecture
- Frontend: Ionic (Angular), consomme l'API REST via HttpClient.
- Backend: Flask avec routes par domaine (auth, gigs, offers, proposals, orders, reviews, messages, admin).
- Base de donnees: MongoDB (collections documentaires).
- Temps reel: Socket.IO (messagerie).
- Fichiers: uploads dans backend/uploads/ (CV, avatars, cahier de charges, cover letters).

### Structure du repo
- appFreelance/: application Ionic/Angular
- backend/: API Flask
- docs/: documentation supplementaire
- TECHNICAL_DOCUMENTATION.md: ce document

## 3) Installation et execution
### Prerequis
- Node.js 20+ et npm
- Python 3.10+
- MongoDB (local ou remote)

### Backend (Flask)
Dans backend/:
```
pip install -r requirements.txt
```
Creer backend/.env:
```
MONGO_URI=mongodb://localhost:27017
MONGO_DB=freelancehub_db
JWT_SECRET_KEY=change-this-secret
FLASK_DEBUG=True
```
Lancer:
```
python app.py
```
API par defaut: http://localhost:5000

### Frontend (Ionic)
Dans appFreelance/:
```
npm install
npm start
```
Configurer l'URL API:
- appFreelance/src/environments/environment.ts
- appFreelance/src/environments/environment.prod.ts

## 4) API (resume non exhaustif)
Base URL: /api

### Auth et profils
- POST /api/register
- POST /api/login
- GET /api/profile
- GET /api/auth/profile/<user_id>

### Admin
- GET /api/admin/pending
- POST /api/admin/validate
- POST /api/admin/reject
- PATCH /api/admin/block/<user_id>
- PATCH /api/admin/unblock/<user_id>

### Gigs / services
- GET /api/gigs
- POST /api/gigs
- PATCH /api/gigs/<gig_id>

### Categories
- GET /api/categories/

### Offres / Propositions (jobs)
- POST /api/offers
- GET /api/offers
- GET /api/offers/<offer_id>
- GET /api/offers/my/offers
- GET /api/offers/by-freelancer/<freelancer_id>
- GET /api/offers/my/jobs

- POST /api/proposals/
- GET /api/proposals/<offer_id>
- PUT /api/proposals/<proposal_id>/accept
- PUT /api/proposals/<proposal_id>/reject
- GET /api/proposals/my/proposals

### Commandes (gig orders)
- POST /api/gigorders
- PATCH /api/gigorders/<order_id>/accept
- PATCH /api/gigorders/<order_id>/deliver
- PATCH /api/gigorders/<order_id>/complete
- PATCH /api/gigorders/<order_id>/revision
- PATCH /api/gigorders/<order_id>/cancel
- GET /api/client/gigorders
- GET /api/freelancer/gigorders
- GET /api/gigorders/<order_id>

### Avis / Reviews
- GET /api/reviews/freelancer/<freelancer_id>
- GET /api/reviews/can-review/<freelancer_id>
- POST /api/reviews
- PATCH /api/reviews/<review_id>/reply
- PATCH /api/reviews/<review_id>/hide

### Messagerie
- GET /api/messages/<offer_id>
- POST /api/messages/
- GET /api/messages/conversations

### Store / Products
- GET /api/products
- POST /api/products/purchase

## 5) Base de donnees (collections principales)
Non exhaustif, les collections principales sont:
- client, freelancer, admin (utilisateurs)
- gig (services)
- gig_order (commandes)
- offers (offres de job)
- proposals (propositions)
- review (avis)
- messages (chat)
- categories (categories de service)
- products (store)

### Champs et statuts importants
- offers.status: open | in_progress | closed
- proposals.status: pending | accepted | rejected
- gig_order.status: pending | in_progress | delivered | completed | cancelled
- review.status: visible | hidden

## 6) Scripts de maintenance
Les scripts utilitaires sont dans backend/scripts/ (seed, nettoyage, patch, tests DB).