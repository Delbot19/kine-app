# Plan de Test détaillé – Kine-app (Express/TypeScript API)

Ce plan est conçu pour être utilisé dans Postman ou pour des tests manuels/automatisés. Il détaille les scénarios principaux, les endpoints, les exemples de requêtes et les résultats attendus.

---

admin
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODc5M2RlMzEwZDIwZTk0NmVkYTExYTIiLCJlbWFpbCI6ImpvaG4uZGVsYm90QGV4YW1wbGVlLmNvbSIsInJvbGUiOiJhZG1pbiIsImlhdCI6MTc1Mjg3MDU3MywiZXhwIjoxNzUzNDc1MzczfQ.0Zz1AWKbuYDUkhlC18UgDiyoL-Lz6W4h-ljaiaC7kVw

patient
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2ODdhYThhNjMxNTk5OGM5N2Y4ZTIyZTYiLCJlbWFpbCI6InBhdGllbnQxQGV4YW1wbGUuY29tIiwicm9sZSI6InBhdGllbnQiLCJpYXQiOjE3NTI4NzI5NDAsImV4cCI6MTc1MzQ3Nzc0MH0.nwbFRXcnNLIIw_KK7NWhiKsLY0Qce3eS9zpEdYn0P4w

## 1. Authentification & User

### 1.1 Inscription d’un patient

- **But** : Créer un compte patient
- **Méthode** : POST
- **Endpoint** : `/auth/register`
- **Payload exemple** :

```json
{
    "email": "patient1@example.com",
    "password": "Test1234!",
    "nom": "Dupont",
    "prenom": "Paul",
    "role": "patient"
}
```

- **Attendu** : 201, token JWT dans la réponse, user créé en base

### 1.2 Connexion

- **But** : Authentifier un utilisateur
- **Méthode** : POST
- **Endpoint** : `/auth/login`
- **Payload exemple** :

```json
{
    "email": "patient1@example.com",
    "password": "Test1234!"
}
```

- **Attendu** : 200, token JWT dans la réponse

### 1.3 Accès protégé sans token

- **But** : Vérifier la sécurité des routes protégées
- **Méthode** : GET
- **Endpoint** : `/patients/me`
- **Headers** : _Aucun token_
- **Attendu** : 401 Unauthorized

### 1.4 Accès protégé avec token invalide

- **Headers** : `Authorization: Bearer FAUXTOKEN`
- **Attendu** : 401 Unauthorized

---

## 2. Patient

### 2.1 Récupérer son profil

- **But** : Un patient récupère son profil
- **Méthode** : GET
- **Endpoint** : `/patients/me`
- **Headers** : `Authorization: Bearer <token_patient>`
- **Attendu** : 200, infos du patient

### 2.2 Modifier son profil

- **But** : Un patient modifie ses infos
- **Méthode** : PATCH
- **Endpoint** : `/patients/me`
- **Headers** : `Authorization: Bearer <token_patient>`
- **Payload exemple** :

```json
{
    "sexe": "H",
    "dateNaissance": "1990-01-01"
}
```

- **Attendu** : 200, infos mises à jour

### 2.3 Suppression de son compte

- **But** : Un patient supprime son compte
- **Méthode** : DELETE
- **Endpoint** : `/patients/me`
- **Headers** : `Authorization: Bearer <token_patient>`
- **Attendu** : 200, suppression en cascade du user

### 2.4 Recherche par nom

- **But** : Rechercher un patient par nom
- **Méthode** : GET
- **Endpoint** : `/patients?nom=Dupont`
- **Headers** : `Authorization: Bearer <token_admin>`
- **Attendu** : 200, liste filtrée

---

## 3. Kiné

### 3.1 Création atomique d’un kiné (admin)

- **But** : Créer un kiné (user + kine)
- **Méthode** : POST
- **Endpoint** : `/admin/register-kine`
- **Headers** : `Authorization: Bearer <token_admin>`
- **Payload exemple** :

```json
{
    "email": "kine1@example.com",
    "password": "Test1234!",
    "nom": "Martin",
    "prenom": "Julie",
    "role": "kine",
    "specialite": "Sport",
    "numeroRPPS": "12345678901",
    "presentation": "Kiné du sport diplômée."
}
```

- **Attendu** : 201, user et kine créés, retourne les deux objets

### 3.2 Recherche kiné par nom

- **But** : Rechercher un kiné
- **Méthode** : GET
- **Endpoint** : `/kines?nom=Martin`
- **Headers** : `Authorization: Bearer <token_patient|kine|admin>`
- **Attendu** : 200, liste filtrée

### 3.3 Modifier son profil (kine)

- **But** : Un kiné modifie son profil
- **Méthode** : PATCH
- **Endpoint** : `/kines/me`
- **Headers** : `Authorization: Bearer <token_kine>`
- **Payload exemple** :

```json
{
    "presentation": "Nouvelle présentation."
}
```

- **Attendu** : 200, profil mis à jour

### 3.4 Suppression d’un kiné (admin)

- **But** : Supprimer un kiné
- **Méthode** : DELETE
- **Endpoint** : `/kines/:id`
- **Headers** : `Authorization: Bearer <token_admin>`
- **Attendu** : 200, suppression du user et du kine

---

## 4. RendezVous

### 4.1 Création d’un RDV (patient)

- **But** : Prendre RDV avec un kiné
- **Méthode** : POST
- **Endpoint** : `/rdvs`
- **Headers** : `Authorization: Bearer <token_patient>`
- **Payload exemple** :

```json
{
    "kineId": "<id_kine>",
    "date": "2024-06-10T10:00:00Z",
    "duree": 30,
    "motif": "Douleur épaule"
}
```

- **Attendu** : 201, statut "en attente", paiementEffectue false

### 4.2 Confirmer un RDV (kine)

- **But** : Confirmer un RDV (statut "à venir", paiementEffectue true)
- **Méthode** : PATCH
- **Endpoint** : `/rdvs/:id/confirm`
- **Headers** : `Authorization: Bearer <token_kine>`
- **Attendu** : 200, statut mis à jour

### 4.3 Terminer un RDV (kine)

- **But** : Marquer un RDV comme terminé
- **Méthode** : PATCH
- **Endpoint** : `/rdvs/:id/complete`
- **Headers** : `Authorization: Bearer <token_kine>`
- **Attendu** : 200, statut "terminé"

### 4.4 Annuler un RDV (patient ou kine)

- **But** : Annuler un RDV
- **Méthode** : PATCH
- **Endpoint** : `/rdvs/:id/cancel`
- **Headers** : `Authorization: Bearer <token_patient|kine>`
- **Attendu** : 200, statut "annulé"

### 4.5 Liste des RDV d’un kiné pour un jour donné

- **But** : Voir les RDV "à venir" d’un kiné pour une date
- **Méthode** : GET
- **Endpoint** : `/rdvs?kineId=<id_kine>&date=2024-06-10`
- **Headers** : `Authorization: Bearer <token_kine|admin>`
- **Attendu** : 200, liste filtrée

### 4.6 Liste des patients d’un kiné

- **But** : Voir tous les patients d’un kiné
- **Méthode** : GET
- **Endpoint** : `/rdvs/patients/<id_kine>`
- **Headers** : `Authorization: Bearer <token_kine|admin>`
- **Attendu** : 200, liste des patients

### 4.7 Horaires d’ouverture du cabinet

- **But** : Récupérer les horaires
- **Méthode** : GET
- **Endpoint** : `/rdvs/cabinet-hours`
- **Headers** : `Authorization: Bearer <token_patient|kine|admin>`
- **Attendu** : 200, horaires du cabinet

---

## 5. Sécurité & Cas limites

### 5.1 Accès non autorisé

- **But** : Vérifier qu’un patient ne peut pas accéder aux données d’un autre patient
- **Méthode** : GET
- **Endpoint** : `/patients/<autre_id>`
- **Headers** : `Authorization: Bearer <token_patient>`
- **Attendu** : 403 Forbidden

### 5.2 Création avec email déjà utilisé

- **But** : Empêcher la création d’un user avec un email existant
- **Méthode** : POST
- **Endpoint** : `/auth/register` ou `/admin/register-kine`
- **Payload** : email déjà utilisé
- **Attendu** : 409 Conflict ou 400

### 5.3 Accès avec token expiré/invalide

- **But** : Vérifier la sécurité JWT
- **Headers** : `Authorization: Bearer <token_invalide>`
- **Attendu** : 401 Unauthorized

### 5.4 Double confirmation/annulation d’un RDV

- **But** : Empêcher la modification d’un RDV déjà terminé/annulé
- **Méthode** : PATCH
- **Endpoint** : `/rdvs/:id/confirm` (sur un RDV déjà terminé)
- **Attendu** : 400 ou 409

---

## 6. Cron d’annulation automatique (test manuel)

- **But** : Vérifier que les RDV "en attente" créés il y a plus de 30 min sont annulés automatiquement
- **Méthode** : PATCH (modifier createdAt en base pour simuler)
- **Vérification** : Après exécution du cron, le statut passe à "annulé"

---

**Ce plan est prêt à être utilisé dans Postman. Adapter les tokens, IDs et payloads selon vos données de test.**
