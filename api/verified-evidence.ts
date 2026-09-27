import type { ModuleData, Source, SourceKind, Topic } from '../src/shared/types';

const files = {
  algLogic: '1Dv8kB_DWCLP7erjAsqar1VeolEwMW1mG',
  algStructures: '1ehBSt9A6Z1q8NWoApPCvCg8uow0Sl0q1',
  algPolynomials: '1HWC4MenipqAR__JrMd_lIP_BksD0Imyk',
  algTdLogic: '1_vDWyRWrc2a_M-mr6BBvNDZwEtk4aUlv',
  algTdStructures: '1jdmkumEcx2XziTwSNMx6pf54SnVxUB7d',
  algTdPolynomials: '1mlxRqIOR7UsOpGK2-6hT7risboxsT6JV',
  algExam2022: '1euVdz5WoVw6g_RO_1OF-Yu_Xmv38_1Bi',
  algExam2023: '1dUqb-3-Z2QsFL9XXSbT4NU5Rg0GLn2Rq',
  algExam2025: '1vpXGUC04IhStHMhNJJHUBhAg7-2pifaF',
  iglMethods: '1DJCdMoFEHmb1qg-EX6IM8W5q9cXlClql',
  iglModeling: '1r5LSQEK9jjnqsGE5X0JGklvBTh6fGhTh',
  iglRequirements: '1QSSRc9hLTpYUqm2MY9z6Af2qVdAfb5NG',
  iglAnalysis: '1Z2sZWkmVQC8wKF7UP1McySRP2YMHnc0C',
  iglArchitecture: '1mOSwmG7Rpnj35RTmencJClLgUMVUEj9_',
  iglDesign: '1CA4-Yt3EFevgKprlTj83LBLREblqSFBN',
  iglTesting: '1izc2ES6lsOAF1oGSozpMCYh4r1NvPeYW',
  iglTd1: '1M9Rgv5dGbbfCvIgFuJkXDZQ3SrFEWvRB',
  iglTd2: '1pSIdqpyXj33uBwWjTGtuVjEXsFZtFb0r',
  iglTd3: '1v2B1hDyXjg7kRxbFddJ5xe__1CSwSX2F',
  iglExam2018: '1mi8V_p8SSBEtoihgYTyekULWXRVoHQ3N',
  iglExam2023: '1840W9rsseJPHiSgtPNCYn4j4nik7QTA6',
} as const;

type Evidence = [topicId: string, kind: SourceKind, title: string, page: number, excerpt: string, fileId: string];

const algebraEvidence: Evidence[] = [
  ['alg-logic', 'course', 'Logic, Sets, Relations and Maps', 1, 'A proposition (or statement) is a sentence that is ether true or false.', files.algLogic],
  ['alg-logic', 'td', 'Tutorial 1 · Logic, Sets, Relations and Maps', 1, 'Exercise 1: Let E be a set and A, B, C three subsets of E. Show that…', files.algTdLogic],
  ['alg-rel', 'course', 'Logic, Sets, Relations and Maps', 7, 'A binary relation on E is a part R of E × E.', files.algLogic],
  ['alg-rel', 'course', 'Logic, Sets, Relations and Maps', 9, 'A map from E to F assigns to each element x of E exactly one element of F.', files.algLogic],
  ['alg-rel', 'td', 'Tutorial 1 · Logic, Sets, Relations and Maps', 1, 'Exercise 5: Consider the binary relation R on R.', files.algTdLogic],
  ['alg-group', 'course', 'Algebraic structures', 3, 'A magma (G, >) is said to be a group', files.algStructures],
  ['alg-group', 'td', 'Tutorial 2 · Algebraic Structures', 1, 'Exercise 1: Is (R, *) a group?', files.algTdStructures],
  ['alg-ring', 'course', 'Algebraic structures', 5, 'Rings and fields · Rings', files.algStructures],
  ['alg-poly', 'course', 'Polynomials', 2, 'The sum and the difference of the polynomials P and Q are defined', files.algPolynomials],
  ['alg-poly', 'td', 'Tutorial · Polynomials', 1, 'Compute in R[X] GCD(A, B) in the following cases.', files.algTdPolynomials],
  ['alg-division', 'course', 'Polynomials', 4, 'Theorem - Definition (Euclidean division)', files.algPolynomials],
  ['alg-division', 'td', 'Tutorial · Polynomials', 1, 'Perform in R[X] the division by increasing power order', files.algTdPolynomials],
  ['alg-gcd', 'course', 'Polynomials', 5, 'GCD(A, B) = GCD(B, R)', files.algPolynomials],
  ['alg-gcd', 'td', 'Tutorial · Polynomials', 1, 'Compute in R[X] GCD(A, B) in the following cases.', files.algTdPolynomials],
  ['alg-root', 'course', 'Polynomials', 7, 'a is a root of P if and only if X − a divides P.', files.algPolynomials],
];

const iglEvidence: Evidence[] = [
  ['igl-process', 'course', 'Lesson 1 · Development methodologies', 3, 'Software Engineering Tools and Professions · Methodologies', files.iglMethods],
  ['igl-cycle', 'course', 'Lesson 1 · Development methodologies', 3, 'Classic Methodologies · Agile Methods · UP (Unified Process)', files.iglMethods],
  ['igl-agile', 'course', 'Lesson 1 · Development methodologies', 84, 'Responding to change over following a plan', files.iglMethods],
  ['igl-agile', 'td', 'Exercise Set 1 · Methodologies', 1, 'According to the Agile Manifesto, which scenario is NOT following agile principles?', files.iglTd1],
  ['igl-up', 'course', 'Lesson 1 · Development methodologies', 3, 'UP (Unified Process)', files.iglMethods],
  ['igl-up', 'td', 'Exercise Set 2 · Requirements', 1, 'During which phase of the UP is the executable architecture prototype delivered?', files.iglTd2],
  ['igl-uml', 'course', 'Lesson 2 · Software Modeling', 16, 'UML is the fusion of the work of several modeling specialists.', files.iglModeling],
  ['igl-requirements', 'course', 'Lesson 3 · Requirements expression', 24, 'The specification model is suitable for both functional and non-functional specifications.', files.iglRequirements],
  ['igl-requirements', 'td', 'Exercise Set 2 · Requirements', 1, 'What is the fundamental difference between a functional and a non-functional requirement?', files.iglTd2],
  ['igl-usecase', 'course', 'Lesson 3 · Requirements expression', 42, 'Find a system boundary · Identify the actors · Identify the use cases', files.iglRequirements],
  ['igl-usecase', 'td', 'Exercise Set 2 · Requirements', 1, 'What is the key distinction between a primary actor and a secondary actor in a use case?', files.iglTd2],
  ['igl-class', 'course', 'Lesson 4 · Analysis', 80, 'Analysis classes are modeled using a class diagram.', files.iglAnalysis],
  ['igl-sequence', 'course', 'Lesson 4 · Analysis', 104, 'Sequence diagrams describe an action ordered in time.', files.iglAnalysis],
  ['igl-activity', 'course', 'Lesson 2 · Software Modeling', 30, 'Activity Diagram', files.iglModeling],
  ['igl-architecture', 'course', 'Lesson 5 · Software Architectures', 76, 'SOA is based on loosely coupled services', files.iglArchitecture],
  ['igl-architecture', 'td', 'Exercise Set 3 · Architectures, Design and Tests', 1, 'What is the difference between an N-tier architecture and MVC?', files.iglTd3],
  ['igl-design', 'course', 'Lesson 6 · Design', 54, 'LSP (Liskov Substitution Principle). OCP (Open Closed Principle).', files.iglDesign],
  ['igl-tests', 'course', 'Lesson 7 · Software Testing', 30, 'A test case is a set of test inputs, execution conditions, and expected results', files.iglTesting],
  ['igl-tests', 'td', 'Exercise Set 3 · Architectures, Design and Tests', 1, 'What is the relationship between test cases and test plans?', files.iglTd3],
];

type ExamQuestion = [examId: string, year: number, topicId: string, page: number, points: number | null, question: string, excerpt: string, fileId: string];

const algebraExamQuestions: ExamQuestion[] = [
  ['alg-2022', 2022, 'alg-root', 1, null, 'Exercise 1: polynomial root multiplicity', 'a root of P of multiplicity m', files.algExam2022],
  ['alg-2022', 2022, 'alg-gcd', 1, null, 'Exercise 1: factorization and polynomial GCD', 'PGCD(A; B)', files.algExam2022],
  ['alg-2022', 2022, 'alg-ring', 1, null, 'Exercise 2: ring structure and invertible elements', 'Determine the invertible elements of the ring', files.algExam2022],
  ['alg-2022', 2022, 'alg-group', 1, null, 'Exercise 2: group homomorphism', 'morphisme de groupes', files.algExam2022],
  ['alg-2023', 2023, 'alg-root', 1, null, 'Exercise 1: complex roots and multiplicity', 'déterminer la multiplicité', files.algExam2023],
  ['alg-2023', 2023, 'alg-gcd', 1, null, 'Exercise 1: polynomial factorization and GCD', 'PGCD(A; B)', files.algExam2023],
  ['alg-2023', 2023, 'alg-ring', 1, null, 'Exercise 2: ring and zero divisors', 'diviseurs de zéro de l’anneau', files.algExam2023],
  ['alg-2023', 2023, 'alg-group', 2, null, 'Exercise 2: group homomorphism, kernel and image', 'morphisme de groupes', files.algExam2023],
  ['alg-2025', 2025, 'alg-division', 1, null, 'Exercise 1.1: Euclidean division', 'Using Euclidean division', files.algExam2025],
  ['alg-2025', 2025, 'alg-root', 1, null, 'Exercise 1.3: roots and multiplicity', 'determine the multiplicity', files.algExam2025],
  ['alg-2025', 2025, 'alg-gcd', 1, null, 'Exercise 1.4: polynomial GCD', 'Deduce GCD(P, Q)', files.algExam2025],
  ['alg-2025', 2025, 'alg-ring', 1, null, 'Exercise 2: subfield and Exercise 3: ring properties', 'Show that Q[√d] is a subfield', files.algExam2025],
  ['alg-2025', 2025, 'alg-group', 1, null, 'Exercise 2.4: group homomorphism and isomorphism', 'Show that f is a group homomorphism', files.algExam2025],
];

const iglExamQuestions: ExamQuestion[] = [
  ['igl-2018', 2018, 'igl-requirements', 1, 1, 'Q1: four functional specifications', 'Donnez quatre (04) spécifications fonctionnelles du système.', files.iglExam2018],
  ['igl-2018', 2018, 'igl-requirements', 2, 1, 'Q2: two technical specifications', 'Donnez deux (02) spécifications techniques du système.', files.iglExam2018],
  ['igl-2018', 2018, 'igl-usecase', 2, 1, 'Q3: secondary actors', 'Y a-t-il des acteurs secondaires ?', files.iglExam2018],
  ['igl-2018', 2018, 'igl-usecase', 2, 3, 'Q4: use-case diagram', 'Donnez le diagramme de cas d’utilisation du système.', files.iglExam2018],
  ['igl-2018', 2018, 'igl-usecase', 3, 1, 'Q5: document a use case', 'Documentez le cas d’utilisation relatif au virement accéléré.', files.iglExam2018],
  ['igl-2018', 2018, 'igl-class', 3, 5, 'Q6: analysis class diagram', 'Donnez le diagramme de classes d’analyse du système', files.iglExam2018],
  ['igl-2018', 2018, 'igl-sequence', 5, 1, 'Q7: sequence diagram', 'En utilisant le diagramme de séquence, modélisez l’opération de paiement mobile', files.iglExam2018],
  ['igl-2018', 2018, 'igl-activity', 5, 2, 'Q8: activity diagram', 'En utilisant le diagramme d’activité, modélisez le processus de virement', files.iglExam2018],
  ['igl-2018', 2018, 'igl-architecture', 6, 1, 'Q9: architecture choice', 'Quelle architecture proposez-vous pour le système ?', files.iglExam2018],
  ['igl-2018', 2018, 'igl-design', 7, 1, 'Q10: assess design against LSP and OCP', 'Considérez-vous la conception bonne ?', files.iglExam2018],
  ['igl-2018', 2018, 'igl-design', 7, 2, 'Q11: propose a better design', 'proposez une meilleure conception', files.iglExam2018],
  ['igl-2018', 2018, 'igl-tests', 7, 1, 'Q12: write a test case', 'Ecrivez le cas de test permettant de valider un virement normal', files.iglExam2018],
  ['igl-2023', 2023, 'igl-requirements', 1, 0.5, 'Q1: valid technical specifications', 'spécifications techniques qui sont valides', files.iglExam2023],
  ['igl-2023', 2023, 'igl-usecase', 1, 0.5, 'Q2: missing actors', 'Acteurs manquants dans le diagramme A', files.iglExam2023],
  ['igl-2023', 2023, 'igl-usecase', 1, 0.75, 'Q3: missing use cases', 'CUs manquants dans le diagramme A', files.iglExam2023],
  ['igl-2023', 2023, 'igl-usecase', 1, 0.5, 'Q4: use cases outside system boundary', 'CUs hors des limites du système', files.iglExam2023],
  ['igl-2023', 2023, 'igl-requirements', 1, 1.5, 'Q5: requirements traceability matrix', 'compléter la matrice de traçabilité', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 2, 0.5, 'Q6: entity classes', 'classes qui doivent être des entités', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 2, 0.5, 'Q7: additional entities', 'éléments à rajouter comme entités', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 2, 0.75, 'Q8: removable classes', 'classes qui peuvent être supprimées', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 2, 0.5, 'Q9: attributes to model as entities', 'attributs qui doivent être changés en entités', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 2, 1, 'Q10: invalid class attributes', 'attributs non valides', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 2, 1, 'Q11: association class', 'classe d’association entre Encadrant et SujetPFE', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 3, 1, 'Q12: invalid multiplicities', 'associations avec des multiplicités invalides', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 3, 1, 'Q13: information represented by the class model', 'informations qui ne peuvent pas être obtenues', files.iglExam2023],
  ['igl-2023', 2023, 'igl-class', 3, 1, 'Q14: composition relationships', 'associations qui peuvent devenir des compositions', files.iglExam2023],
  ['igl-2023', 2023, 'igl-design', 3, 1.5, 'Q15: dependency inversion principle', 'principe DIP n’a pas été respecté', files.iglExam2023],
  ['igl-2023', 2023, 'igl-design', 3, 1.5, 'Q16: single responsibility principle', 'ne respectent pas le principe SRP', files.iglExam2023],
  ['igl-2023', 2023, 'igl-architecture', 3, 1, 'Q17: architecture styles', 'styles architecturaux', files.iglExam2023],
  ['igl-2023', 2023, 'igl-architecture', 4, 1, 'Q19: MVC anomaly', 'anomalie relative à l’architecture MVC', files.iglExam2023],
  ['igl-2023', 2023, 'igl-design', 4, 1, 'Q20: interface usage and implementation', 'interface IEvaluation', files.iglExam2023],
  ['igl-2023', 2023, 'igl-sequence', 4, 2, 'Q21: complete a sequence diagram', 'Compléter le diagramme C', files.iglExam2023],
  ['igl-2023', 2023, 'igl-tests', 4, 1, 'Q22: evaluation test case', 'Rédigez un cas de test', files.iglExam2023],
];

function driveUrl(fileId: string) {
  return `https://drive.google.com/file/d/${fileId}/view`;
}

function addSource(topic: Topic, kind: SourceKind, title: string, page: number, excerpt: string, fileId: string, extra: Partial<Source> = {}): Source {
  const source: Source = { id: `${fileId}-${topic.id}-${topic.sources.length}`, kind, title, page, excerpt, url: driveUrl(fileId), ...extra };
  topic.sources.push(source);
  return source;
}

export function addVerifiedEvidence(modules: ModuleData[]): void {
  for (const module of modules) {
    const byId = new Map(module.topics.map(topic => [topic.id, topic]));
    module.occurrences = [];
    const evidence = module.id === 'esi-alg1' ? algebraEvidence : iglEvidence;
    const questions = module.id === 'esi-alg1' ? algebraExamQuestions : iglExamQuestions;
    for (const [topicId, kind, title, page, excerpt, fileId] of evidence) {
      const topic = byId.get(topicId);
      if (topic) addSource(topic, kind, title, page, excerpt, fileId);
    }
    for (const [examId, year, topicId, page, points, question, excerpt, fileId] of questions) {
      const topic = byId.get(topicId);
      if (!topic) continue;
      const linked = addSource(topic, 'exam', `ESI ${module.title} · ${year} exam`, page, excerpt, fileId, { year, question, points });
      module.occurrences.push({ examId, year, topicId, points, totalPoints: 20, question, sourceId: linked.id });
    }
  }
}
