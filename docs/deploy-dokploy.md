# Déployer RevisionOS sur Dokploy

L'application tourne en 3 conteneurs, définis dans `docker-compose.prod.yml` :

| Service | Rôle | Image |
|---|---|---|
| `web` | Frontend Next.js, port 3000. Relaie `/api/*` vers `api` | `docker/web.Dockerfile` |
| `api` | API Fastify, port 4000 (interne). Crée le schéma au démarrage | `docker/api.Dockerfile` |
| `db` | PostgreSQL 17 + pgvector | `pgvector/pgvector:pg17` |

Seul `web` est exposé publiquement.

## 1. Créer l'application

1. Dans Dokploy : **Create Service → Compose**.
2. **Provider** : GitHub, dépôt `sidjamyl/revisionOS`, branche `main`.
3. **Compose Path** : `./docker-compose.prod.yml`.

## 2. Variables d'environnement (onglet Environment)

```env
POSTGRES_PASSWORD=choisis-un-mot-de-passe-long
AIGRID_CHAT_API_KEY=
AIGRID_EMBED_API_KEY=
```

- `POSTGRES_PASSWORD` : **obligatoire**.
- `AIGRID_CHAT_API_KEY` et `AIGRID_EMBED_API_KEY` : **à laisser vides pour la démo**. Les étudiants n'en ont pas besoin, puisque tout est lu depuis la base. Elles servent seulement à analyser un nouveau PDF envoyé via `/admin`. Or `/admin` n'a pas de mot de passe : avec les clés, n'importe qui pourrait consommer tes crédits AIGrid.
- Variables facultatives, avec leurs valeurs par défaut : `AIGRID_BASE_URL=https://app.ai-grid.io/v1`, `AIGRID_CHAT_MODEL=Qwen/Qwen3.8-27B`, `AIGRID_EMBED_MODEL=Alibaba-NLP/gte-Qwen2-7B-instruct`.

## 3. Domaine (onglet Domains)

- **Service** : `web`
- **Port** : `3000`
- **Host** : ton domaine, ou le domaine généré par Dokploy. Active HTTPS (Let's Encrypt).

Clique ensuite sur **Deploy**. Au premier démarrage, `api` active pgvector et crée les tables vides. Le site s'affiche, mais les modules restent en « Analysis in progress » tant que les données ne sont pas importées (étape 4).

## 4. Importer les données (une seule fois)

Les PDF et le texte des cours ne sont pas dans Git : ce sont des documents de l'ESI. Il faut les copier directement sur le serveur.

### 4.1 Sur ton PC (PowerShell, dans le dossier du projet)

```powershell
# Exporte les données de la base locale (modules, documents, pages indexées)
docker exec gomycode-db-1 pg_dump -U revisionos -d revisionos --data-only -Fc -f /tmp/revisionos.dump
docker cp gomycode-db-1:/tmp/revisionos.dump .\revisionos.dump

# Envoie la sauvegarde et les PDF sur le serveur (remplace user@serveur)
scp .\revisionos.dump user@serveur:/tmp/
scp -r .\.data\imports .\.data\uploads user@serveur:/tmp/revisionos-data/
```

### 4.2 Sur le serveur (SSH)

```bash
# Repère les noms des conteneurs créés par Dokploy
docker ps --format '{{.Names}}' | grep -E -- '-(db|api)-'

DB=<nom-du-conteneur-db>     # ex. revisionos-abc123-db-1
API=<nom-du-conteneur-api>   # ex. revisionos-abc123-api-1

# Restaure les données dans les tables créées par l'API
docker cp /tmp/revisionos.dump $DB:/tmp/revisionos.dump
docker exec $DB pg_restore -U revisionos -d revisionos --data-only --disable-triggers /tmp/revisionos.dump

# Copie les PDF dans le volume de l'API (aperçus de pages et « Open PDF »)
docker cp /tmp/revisionos-data/imports $API:/app/.data/
docker cp /tmp/revisionos-data/uploads $API:/app/.data/
```

Recharge le site : les modules, le quiz et les graphes apparaissent. Les données sont dans des volumes Docker, donc elles survivent aux redéploiements.

## Vérifications rapides

- `https://<domaine>/api/health` doit renvoyer `{"ok":true}`.
- `https://<domaine>/?reset` repart de zéro, comme un nouvel étudiant.
- En cas de problème : onglet **Logs** du service `api` dans Dokploy.

## Limites connues en production

- L'OCR des pages scannées utilise l'OCR de Windows. Il ne fonctionne pas dans le conteneur Linux. Le corpus déjà importé n'est pas concerné, mais un nouvel envoi de PDF scanné échouerait.
- `/admin` est public, sans authentification.
