# Utilisation de l'IA dans RevisionOS

Ce document liste chaque endroit où l'intelligence artificielle intervient : dans le produit lui-même, puis dans sa fabrication. Il précise aussi ce qui n'est **pas** fait par l'IA.

## 1. Dans le produit

L'IA intervient uniquement **pendant l'import des documents** (côté administration, hors ligne). Un étudiant qui utilise l'application ne déclenche aucun appel à un modèle : tout ce qu'il voit est lu depuis la base de données et calculé par du code classique.

Le corpus : 35 PDF fournis par l'équipe (cours, TD et examens d'Algèbre 1 et d'Introduction au génie logiciel de l'ESI Alger). Ils sont traités par `scripts/rebuild-corpus.ts`, ou un par un via l'upload de l'admin (`POST /api/admin/modules/:id/documents`). Dans les deux cas, le traitement passe par `processDocument` dans `api/ingestion.ts`.

### 1.1 Modèle de langage : Qwen3.8-27B

| | |
|---|---|
| Modèle | `Qwen/Qwen3.8-27B` (Alibaba, poids ouverts) |
| Hébergement | AIGrid, API compatible OpenAI (`https://app.ai-grid.io/v1`) |
| Appel | Vercel AI SDK, `generateText`, dans la fonction `qwen()` de `api/ingestion.ts` |
| Réglages | Raisonnement (« thinking ») désactivé, 12 000 tokens de sortie max, délai de 420 s, 2 tentatives max |
| Contrôle de la sortie | Réponse attendue en JSON, validée par un schéma Zod ; toute réponse invalide est rejetée |
| Cache | Chaque réponse validée est enregistrée dans `.data/analysis/<document>/<étape>.json`. Relancer l'import ne rappelle pas le modèle. |

Qwen fait trois tâches, et seulement celles-ci.

**a) Extraire les notions des cours** (`analyzeCourseGroup`)
- Entrée : le texte des pages du cours, par paquets de 12 pages ou 7 500 caractères au plus. Si un paquet échoue, il est coupé en deux et renvoyé.
- Sortie, pour chaque notion : titre et résumé en anglais, chapitre, titres des notions prérequises, page, **citation exacte** du cours et indice de confiance.
- Ce que fait ensuite le code, sans IA :
  - fusion des notions de même titre ;
  - conversion des prérequis en liens du graphe, en refusant tout lien qui créerait un cycle ;
  - vérification que la citation figure bien sur la page indiquée. Sinon, la confiance est plafonnée à 0,4 et la notion s'affiche avec « Check source » (bordure en pointillés).

**b) Relier chaque question de TD ou d'examen à une notion** (`analyzeQuestionGroup`)
- Entrée : une page de TD ou d'examen, la liste des notions candidates (40 au plus, présélectionnées comme décrit en 1.2) et un extrait des pages de cours proches (2 000 caractères).
- Sortie, pour chaque sous-question : la notion principale, l'exercice, le numéro de question, les points de la question et de l'exercice s'ils sont imprimés, la page, une citation et un indice de confiance. Pour un examen, le modèle renvoie aussi l'année et le barème total.
- Ce que fait ensuite le code, sans IA :
  - les réponses qui citent une notion inexistante sont ignorées ;
  - quand un examen donne le total d'un exercice mais pas celui de chaque sous-question, le reste est réparti à parts égales et marqué comme **estimé** (`estimateMissingExamPoints`) ;
  - les points ne sont jamais comptés deux fois : une question a une seule notion principale.

**c) Générer le quiz de positionnement** (`generateQuiz`)
- Entrée : la liste des notions extraites du module et leurs résumés.
- Sortie : 7 questions à choix multiples, avec 4 réponses et une seule bonne réponse.
- Ce que fait ensuite le code, sans IA : les questions qui citent une notion inconnue sont retirées. La correction est entièrement déterministe (`gradeQuiz`). Une question sans réponse (« I don't know ») laisse la notion « non testée », elle ne compte pas comme une erreur.

### 1.2 Modèle d'embeddings : gte-Qwen2-7B-instruct

| | |
|---|---|
| Modèle | `Alibaba-NLP/gte-Qwen2-7B-instruct`, via AIGrid |
| Code | `api/retrieval.ts` (`indexCoursePages`, `retrieveCoursePages`) |
| Stockage | PostgreSQL + pgvector, vecteurs de 3 584 dimensions ; l'identifiant du modèle est enregistré avec chaque vecteur |

- **Indexation** : chaque page de cours d'au moins 80 caractères (les 3 500 premiers caractères) est transformée en vecteur une seule fois, à l'import.
- **Recherche** : pendant l'étape 1.1 b, la page de TD ou d'examen est transformée en vecteur. Les 6 pages de cours les plus proches (distance cosinus) servent à deux choses : classer en premier les notions candidates tirées de ces pages, et fournir un contexte à Qwen.
- Le code prévoit deux autres fournisseurs d'embeddings, Google `gemini-embedding-001` et Ollama. Ils ne sont **pas utilisés** : la configuration est `AI_PROVIDER=aigrid`.

### 1.3 Reconnaissance de texte (OCR) sur les pages scannées

- Moteur : **l'OCR intégré à Windows** (`Windows.Media.Ocr`, langue fr-FR), appelé par `scripts/ocr-page.ps1`.
- Il s'exécute en local, sans service externe. C'est de la reconnaissance de caractères par apprentissage automatique, pas un modèle génératif.
- Déclenchement : seulement pour les pages dont le PDF contient moins de 80 caractères de texte extractible. La page est d'abord convertie en image (`pdftoppm`, 80 dpi, niveaux de gris).
- Le texte obtenu est mis en cache dans `.data/ocr/`, puis transmis à Qwen, qui ne lit jamais les images directement.

## 2. Ce qui n'utilise pas d'IA

Tout ce qui suit est du code déterministe, testé dans `tests/domain.test.ts` :

- l'extraction du texte des PDF (pdf.js) ;
- le **score de priorité** : `60 % × fréquence d'apparition aux examens + 40 % × part moyenne des points connus` (`api/domain.ts`) ;
- le **parcours prioritaire** : les notions les mieux classées plus tous leurs prérequis. Leur nombre dépend du temps avant l'examen : 10 sans date ou à plus de 14 jours, 6 entre 8 et 14 jours, 4 entre 4 et 7 jours, 2 à 3 jours ou moins ;
- la **vue Overview** du graphe (12 notions clés) : sélection et liens condensés calculés par `src/lib/compact-graph.ts`, sans Qwen ;
- le **plan du jour** et le rythme (« N concepts per day ») : notions prioritaires restantes, dans l'ordre des prérequis, réparties sur les jours avant l'examen ;
- la correction du quiz, la progression de l'étudiant (enregistrée dans le navigateur) et la mise en page du graphe.

## 3. Limites connues

- Les notions, liens de prérequis et correspondances aux examens produits par Qwen **n'ont pas tous été vérifiés par un humain**. Les résultats de faible confiance sont signalés dans l'interface, et chaque recommandation renvoie à sa page source (aperçu du PDF à la bonne page) pour être vérifiable.
- Au moment de la rédaction, l'import du corpus n'est pas terminé à 100 % : certains TD et examens ont échoué et doivent être relancés. L'état de chaque document est visible sur `/admin`.
- Qwen extrait des notions assez fines, et certaines se recoupent d'un cours à l'autre. La vue Overview sert justement à donner une vue d'ensemble lisible.

## 4. Dans la fabrication du projet

| Outil | Utilisation |
|---|---|
| **OpenAI Codex / ChatGPT** | Analyse du site du hackathon. Écriture d'une grande partie du code initial : les commits `777aea0`, `d783ab4`, `0f1b974`, `9e21ad4` et `a694552` sont signés « Codex ». Les commits `7d04734` et `b9cf6a0` (intégration AIGrid) n'ont pas d'auteur identifié dans git. |
| **Claude Code (Anthropic, Claude Opus 5.5)** | Diagnostic et correction de l'import : délai d'attente partagé entre deux tentatives, raisonnement de Qwen qui tronquait le JSON, caractères de contrôle issus de l'OCR. Réécriture des tests unitaires. Refonte de l'onboarding, du tableau de bord et du quiz (shadcn/ui). Vue Overview du graphe, dates d'examen, plan du jour, corrections de navigation et de zoom. |

Tout ce travail a été relu, dirigé et testé par l'équipe, qui a aussi fourni les 35 PDF et fait les choix produit.

> **À compléter par l'équipe avant l'envoi** : préciser si `DESIGN.md` / `DESIGN.json` (commit `7c93eaf`) et les maquettes d'interface ont été produits avec l'aide d'une IA.
