import type { CatalogProgram, ExamOccurrence, ModuleData, QuizQuestion, SourceKind, Topic } from '../src/shared/types';

const algebraSyllabus = 'https://www.esi.dz/course/algebre/';
const iglSyllabus = 'https://www.esi.dz/course/introduction-au-genie-logiciel/';
const now = new Date().toISOString();

function topic(
  id: string,
  title: string,
  chapter: string,
  summary: string,
  prerequisites: string[],
  syllabusUrl: string,
): Topic {
  return {
    id,
    title,
    chapter,
    summary,
    prerequisites,
    confidence: 0.75,
    sources: [{
      id: `${id}-syllabus`,
      kind: 'syllabus' as SourceKind,
      title: 'Programme officiel ESI',
      page: null,
      excerpt: `Le programme officiel présente « ${title} » dans ${chapter.toLowerCase()}. Le passage précis du cours sera ajouté avec les PDF de l’équipe.`,
      url: syllabusUrl,
    }],
  };
}

function quiz(id: string, topicId: string, prompt: string, options: [string, string, string, string], answerIndex: number): QuizQuestion {
  return { id, topicId, prompt, options, answerIndex };
}

function occurrence(examId: string, year: number, topicId: string, points: number | null, question: string): ExamOccurrence {
  return { examId, year, topicId, points, totalPoints: 20, question, sourceId: null };
}

export const demoModules: ModuleData[] = [
  {
    id: 'esi-alg1', title: 'Algèbre 1', institution: 'ESI Alger',
    program: 'Ingénieur d’État en informatique', level: '1re année préparatoire',
    isDemonstration: true, updatedAt: now,
    topics: [
      topic('alg-logic', 'Logique et ensembles', 'Rappels et compléments', 'Propositions, quantificateurs et opérations sur les ensembles.', [], algebraSyllabus),
      topic('alg-rel', 'Relations et applications', 'Rappels et compléments', 'Relations, fonctions, injectivité, surjectivité et bijectivité.', ['alg-logic'], algebraSyllabus),
      topic('alg-group', 'Groupes et morphismes', 'Structures algébriques', 'Opérations, sous-groupes et morphismes de groupes.', ['alg-rel'], algebraSyllabus),
      topic('alg-ring', 'Anneaux et corps', 'Structures algébriques', 'Anneaux, corps et propriétés des opérations.', ['alg-group'], algebraSyllabus),
      topic('alg-poly', 'Opérations sur les polynômes', 'Polynômes', 'Somme, produit et division des polynômes.', ['alg-ring'], algebraSyllabus),
      topic('alg-root', 'Racines et multiplicité', 'Polynômes', 'Racines, ordre de multiplicité et polynôme dérivé.', ['alg-poly'], algebraSyllabus),
      topic('alg-fraction', 'Fractions rationnelles', 'Fractions rationnelles', 'Définition, domaine de validité et opérations.', ['alg-poly'], algebraSyllabus),
      topic('alg-decomp', 'Décomposition en éléments simples', 'Fractions rationnelles', 'Écriture d’une fraction rationnelle sous forme d’éléments simples.', ['alg-fraction', 'alg-root'], algebraSyllabus),
    ],
    // Illustrative occurrences are replaced by real, cited exams when documents arrive.
    occurrences: [
      occurrence('alg-demo-2023', 2023, 'alg-poly', 4, 'Question illustrative sur les opérations polynomiales'),
      occurrence('alg-demo-2023', 2023, 'alg-root', 3, 'Question illustrative sur les racines'),
      occurrence('alg-demo-2023', 2023, 'alg-decomp', 5, 'Question illustrative sur la décomposition'),
      occurrence('alg-demo-2024', 2024, 'alg-poly', 3, 'Question illustrative sur les polynômes'),
      occurrence('alg-demo-2024', 2024, 'alg-fraction', 4, 'Question illustrative sur les fractions rationnelles'),
      occurrence('alg-demo-2024', 2024, 'alg-decomp', null, 'Question illustrative sans points lisibles'),
      occurrence('alg-demo-2025', 2025, 'alg-rel', 2, 'Question illustrative sur les applications'),
      occurrence('alg-demo-2025', 2025, 'alg-root', 4, 'Question illustrative sur la multiplicité'),
      occurrence('alg-demo-2025', 2025, 'alg-decomp', 5, 'Question illustrative sur la décomposition'),
    ],
    quiz: [
      quiz('alg-q1', 'alg-logic', 'Que signifie A ∩ B ?', ['La réunion de A et B', 'Les éléments communs à A et B', 'Le complément de A', 'Le produit de A et B'], 1),
      quiz('alg-q2', 'alg-rel', 'Une application bijective est…', ['Injective et surjective', 'Seulement injective', 'Seulement surjective', 'Toujours constante'], 0),
      quiz('alg-q3', 'alg-group', 'Dans un groupe, chaque élément possède…', ['Une dérivée', 'Un inverse', 'Une racine', 'Une image unique'], 1),
      quiz('alg-q4', 'alg-poly', 'Quel est le degré de (X² + 1)(X³ − 2) ?', ['2', '3', '5', '6'], 2),
      quiz('alg-q5', 'alg-root', 'Si P(a) = 0, alors a est…', ['Un coefficient', 'Une racine de P', 'Le degré de P', 'Un diviseur de X'], 1),
      quiz('alg-q6', 'alg-fraction', 'Une fraction rationnelle P/Q est définie lorsque…', ['P = 0', 'Q = 0', 'Q ≠ 0', 'P = Q'], 2),
      quiz('alg-q7', 'alg-decomp', 'Avant de décomposer P/Q en éléments simples, on cherche notamment…', ['Les racines du dénominateur', 'La dérivée du numérateur uniquement', 'La somme des coefficients', 'Une application bijective'], 0),
    ],
  },
  {
    id: 'esi-igl', title: 'Introduction au génie logiciel', institution: 'ESI Alger',
    program: 'Ingénieur d’État en informatique', level: '1re année du cycle supérieur (3e année)',
    isDemonstration: true, updatedAt: now,
    topics: [
      topic('igl-process', 'Activités de développement', 'Introduction générale', 'Les grandes activités du développement logiciel et leurs rôles.', [], iglSyllabus),
      topic('igl-cycle', 'Cycles de vie', 'Cycles de vie', 'Phases et modèles de cycle de vie du logiciel.', ['igl-process'], iglSyllabus),
      topic('igl-agile', 'Méthodes agiles', 'Cycles de vie', 'Développement itératif et adaptation au changement.', ['igl-cycle'], iglSyllabus),
      topic('igl-up', 'Processus unifié (UP)', 'Cycles de vie', 'Organisation itérative du développement avec UP.', ['igl-cycle'], iglSyllabus),
      topic('igl-uml', 'Fondamentaux UML', 'Introduction à UML', 'Rôle d’UML et familles de diagrammes.', [], iglSyllabus),
      topic('igl-usecase', 'Cas d’utilisation', 'Expression des besoins', 'Acteurs, scénarios et diagrammes de cas d’utilisation.', ['igl-uml', 'igl-up'], iglSyllabus),
      topic('igl-class', 'Diagrammes de classes', 'Analyse', 'Classes, associations et relations structurelles.', ['igl-uml'], iglSyllabus),
      topic('igl-sequence', 'Diagrammes de séquence', 'Analyse', 'Interactions entre objets dans le temps.', ['igl-class'], iglSyllabus),
      topic('igl-tests', 'Cas de test', 'Tests', 'Scénarios vérifiables et critères de réussite.', ['igl-usecase'], iglSyllabus),
    ],
    occurrences: [
      occurrence('igl-demo-2023', 2023, 'igl-cycle', 3, 'Question illustrative sur les cycles de vie'),
      occurrence('igl-demo-2023', 2023, 'igl-usecase', 5, 'Question illustrative de modélisation'),
      occurrence('igl-demo-2023', 2023, 'igl-class', 4, 'Question illustrative sur un diagramme de classes'),
      occurrence('igl-demo-2024', 2024, 'igl-up', 3, 'Question illustrative sur UP'),
      occurrence('igl-demo-2024', 2024, 'igl-usecase', 4, 'Question illustrative sur les cas d’utilisation'),
      occurrence('igl-demo-2024', 2024, 'igl-sequence', 4, 'Question illustrative sur les interactions'),
      occurrence('igl-demo-2025', 2025, 'igl-agile', 2, 'Question illustrative sur l’agilité'),
      occurrence('igl-demo-2025', 2025, 'igl-class', 5, 'Question illustrative sur les classes'),
      occurrence('igl-demo-2025', 2025, 'igl-tests', null, 'Question illustrative sans barème lisible'),
    ],
    quiz: [
      quiz('igl-q1', 'igl-process', 'À quoi sert principalement l’analyse des besoins ?', ['À choisir une couleur', 'À comprendre ce que doit faire le système', 'À compiler le code', 'À publier l’application'], 1),
      quiz('igl-q2', 'igl-cycle', 'Un cycle de vie logiciel décrit…', ['Les étapes du projet', 'La durée de vie d’un ordinateur', 'Les droits d’auteur', 'La taille du code'], 0),
      quiz('igl-q3', 'igl-agile', 'Dans une méthode agile, on travaille généralement…', ['Sans retours utilisateurs', 'En itérations courtes', 'Sans tests', 'Avec une seule livraison finale'], 1),
      quiz('igl-q4', 'igl-uml', 'UML sert principalement à…', ['Modéliser un système', 'Compiler du Java', 'Héberger un site', 'Chiffrer une base'], 0),
      quiz('igl-q5', 'igl-usecase', 'Dans un diagramme de cas d’utilisation, un acteur représente…', ['Une classe Java', 'Un rôle qui interagit avec le système', 'Un test automatisé', 'Une base de données'], 1),
      quiz('igl-q6', 'igl-class', 'Quel diagramme montre les classes et leurs associations ?', ['Diagramme de classes', 'Diagramme de séquence', 'Diagramme de déploiement', 'Diagramme d’activité'], 0),
      quiz('igl-q7', 'igl-tests', 'Un cas de test doit inclure…', ['Une entrée et un résultat attendu', 'Seulement un titre', 'Le nom du développeur', 'Une couleur de priorité'], 0),
    ],
  },
];

export const catalog: CatalogProgram[] = [
  {
    id: 'esi-informatique', institution: 'ESI Alger', title: 'Ingénieur d’État en informatique',
    modules: [
      { id: 'esi-alg1', title: 'Algèbre 1', level: '1re année préparatoire', ready: true, sourceUrl: algebraSyllabus },
      { id: 'esi-igl', title: 'Introduction au génie logiciel', level: '3e année', ready: true, sourceUrl: iglSyllabus },
    ],
  },
  {
    id: 'usthb-informatique', institution: 'USTHB', title: 'Licence informatique',
    modules: [
      { id: 'usthb-alg1', title: 'Algèbre 1', level: '1re année', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/licence-syst%C3%A8mes-d%E2%80%99information-et-g%C3%A9nie-logiciel%20' },
      { id: 'usthb-poo', title: 'Programmation orientée objet', level: '2e année', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/Licence-Informatique' },
      { id: 'usthb-bdd', title: 'Bases de données', level: '2e année', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/Licence-Informatique' },
    ],
  },
  {
    id: 'usthb-sigl', institution: 'USTHB', title: 'Licence systèmes d’information et génie logiciel',
    modules: [
      { id: 'usthb-sigl-alg1', title: 'Algèbre 1', level: '1re année', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/licence-syst%C3%A8mes-d%E2%80%99information-et-g%C3%A9nie-logiciel%20' },
      { id: 'usthb-sigl-algo', title: 'Programmation et structures de données', level: '1re année', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/licence-syst%C3%A8mes-d%E2%80%99information-et-g%C3%A9nie-logiciel%20' },
    ],
  },
  {
    id: 'enp-prepa', institution: 'ENP Alger', title: 'Classes préparatoires',
    modules: [
      { id: 'enp-alg1', title: 'Algèbre 1', level: '1re année', ready: false, sourceUrl: 'https://elearning.cp.enp.edu.dz/?lang=fr' },
    ],
  },
  {
    id: 'enp-automatique', institution: 'ENP Alger', title: 'Ingénieur en automatique',
    modules: [
      { id: 'enp-aut-av', title: 'Automatique avancée', level: '3e année', ready: false, sourceUrl: 'https://www.enp.edu.dz/storage/2020/09/Programme-Ingenieur-Automatique-2015.pdf' },
    ],
  },
  {
    id: 'enp-dsia', institution: 'ENP Alger', title: 'Ingénieur Data Science et Intelligence Artificielle',
    modules: [
      { id: 'enp-dsia-programme', title: 'Programme pédagogique', level: 'Cycle ingénieur', ready: false, sourceUrl: 'https://www.enp.edu.dz/storage/2022/03/Programme-Ingenieur-Data-Sscience-Intelligence-Artificielle-2020.pdf' },
    ],
  },
];
