import type { CatalogProgram, ModuleData, QuizQuestion, SourceKind, Topic } from '../src/shared/types';
import { addVerifiedEvidence } from './verified-evidence';

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
      title: 'Official ESI syllabus',
      page: null,
      excerpt: `Syllabus-level reference for “${title}”. See linked course passages and exercises where available.`,
      url: syllabusUrl,
      isDemonstration: true,
    }],
  };
}

function quiz(id: string, topicId: string, prompt: string, options: [string, string, string, string], answerIndex: number): QuizQuestion {
  return { id, topicId, prompt, options, answerIndex };
}

export const demoModules: ModuleData[] = [
  {
    id: 'esi-alg1', title: 'Algebra 1', institution: 'ESI Algiers',
    program: 'Computer Science Engineering', level: 'First preparatory year',
    isDemonstration: true, updatedAt: now,
    topics: [
      topic('alg-logic', 'Logic and sets', 'Foundations', 'Propositions, quantifiers and set operations.', [], algebraSyllabus),
      topic('alg-rel', 'Relations and maps', 'Foundations', 'Relations, functions, injectivity, surjectivity and bijectivity.', ['alg-logic'], algebraSyllabus),
      topic('alg-group', 'Groups and homomorphisms', 'Algebraic structures', 'Operations, subgroups and group homomorphisms.', [], algebraSyllabus),
      topic('alg-ring', 'Rings and fields', 'Algebraic structures', 'Rings, fields and properties of operations.', ['alg-group'], algebraSyllabus),
      topic('alg-poly', 'Polynomial operations', 'Polynomials', 'Addition, multiplication and division of polynomials.', ['alg-ring'], algebraSyllabus),
      topic('alg-division', 'Euclidean polynomial division', 'Polynomials', 'Quotients and remainders in polynomial division.', ['alg-poly'], algebraSyllabus),
      topic('alg-gcd', 'Polynomial GCD', 'Polynomials', 'Euclidean algorithm and greatest common divisors of polynomials.', ['alg-division'], algebraSyllabus),
      topic('alg-root', 'Roots and multiplicity', 'Polynomials', 'Roots, multiplicity and polynomial derivatives.', ['alg-poly'], algebraSyllabus),
      topic('alg-fraction', 'Rational fractions', 'Rational fractions', 'Definitions, domains and operations.', ['alg-poly'], algebraSyllabus),
      topic('alg-decomp', 'Partial fraction decomposition', 'Rational fractions', 'Expressing rational fractions as a sum of simple elements.', ['alg-fraction', 'alg-root'], algebraSyllabus),
    ],
    occurrences: [],
    quiz: [
      quiz('alg-q1', 'alg-logic', 'What does A ∩ B mean?', ['The union of A and B', 'Elements shared by A and B', 'The complement of A', 'The product of A and B'], 1),
      quiz('alg-q2', 'alg-rel', 'A bijective map is…', ['Injective and surjective', 'Only injective', 'Only surjective', 'Always constant'], 0),
      quiz('alg-q3', 'alg-group', 'In a group, every element has…', ['A derivative', 'An inverse', 'A root', 'A unique image'], 1),
      quiz('alg-q4', 'alg-poly', 'What is the degree of (X² + 1)(X³ − 2)?', ['2', '3', '5', '6'], 2),
      quiz('alg-q5', 'alg-root', 'If P(a) = 0, then a is…', ['A coefficient', 'A root of P', 'The degree of P', 'A divisor of X'], 1),
      quiz('alg-q6', 'alg-fraction', 'A rational fraction P/Q is defined when…', ['P = 0', 'Q = 0', 'Q ≠ 0', 'P = Q'], 2),
      quiz('alg-q7', 'alg-decomp', 'Before decomposing P/Q into partial fractions, you need to find…', ['Roots of the denominator', 'Only the numerator derivative', 'The sum of coefficients', 'A bijective map'], 0),
    ],
  },
  {
    id: 'esi-igl', title: 'Introduction to Software Engineering', institution: 'ESI Algiers',
    program: 'Computer Science Engineering', level: 'Third year',
    isDemonstration: true, updatedAt: now,
    topics: [
      topic('igl-process', 'Development activities', 'Introduction', 'The main software development activities and their roles.', [], iglSyllabus),
      topic('igl-cycle', 'Software life cycles', 'Life cycles', 'Phases and life-cycle models.', ['igl-process'], iglSyllabus),
      topic('igl-agile', 'Agile methods', 'Life cycles', 'Iterative development and adaptation to change.', ['igl-cycle'], iglSyllabus),
      topic('igl-up', 'Unified Process (UP)', 'Life cycles', 'Iterative development organized with UP.', ['igl-cycle'], iglSyllabus),
      topic('igl-uml', 'UML fundamentals', 'UML', 'The purpose of UML and its diagram families.', [], iglSyllabus),
      topic('igl-requirements', 'Functional and technical requirements', 'Requirements', 'Distinguishing system functions from technical constraints.', ['igl-process'], iglSyllabus),
      topic('igl-usecase', 'Use cases', 'Requirements', 'Actors, scenarios and use-case diagrams.', ['igl-uml', 'igl-requirements'], iglSyllabus),
      topic('igl-class', 'Class diagrams', 'Analysis', 'Classes, associations and structural relationships.', ['igl-uml'], iglSyllabus),
      topic('igl-sequence', 'Sequence diagrams', 'Analysis', 'Interactions between objects over time.', ['igl-class'], iglSyllabus),
      topic('igl-activity', 'Activity diagrams', 'Analysis', 'Workflow, decisions and partitions in activity diagrams.', ['igl-uml'], iglSyllabus),
      topic('igl-architecture', 'Architectural styles', 'Architecture', 'Choosing among layered, service-oriented and other architectural styles.', ['igl-process'], iglSyllabus),
      topic('igl-design', 'SOLID design principles', 'Design', 'Applying LSP, OCP and other object-oriented design principles.', ['igl-class'], iglSyllabus),
      topic('igl-tests', 'Test cases', 'Testing', 'Testable scenarios and success criteria.', ['igl-usecase'], iglSyllabus),
    ],
    occurrences: [],
    quiz: [
      quiz('igl-q1', 'igl-process', 'What is the main purpose of requirements analysis?', ['Choosing a color', 'Understanding what the system must do', 'Compiling the code', 'Publishing the app'], 1),
      quiz('igl-q2', 'igl-cycle', 'A software life cycle describes…', ['The project stages', 'A computer’s lifespan', 'Copyright rules', 'The code size'], 0),
      quiz('igl-q3', 'igl-agile', 'Agile methods usually work…', ['Without user feedback', 'In short iterations', 'Without testing', 'With one final delivery'], 1),
      quiz('igl-q4', 'igl-uml', 'UML is mainly used to…', ['Model a system', 'Compile Java', 'Host a website', 'Encrypt a database'], 0),
      quiz('igl-q5', 'igl-usecase', 'In a use-case diagram, an actor represents…', ['A Java class', 'A role interacting with the system', 'An automated test', 'A database'], 1),
      quiz('igl-q6', 'igl-class', 'Which diagram shows classes and their associations?', ['Class diagram', 'Sequence diagram', 'Deployment diagram', 'Activity diagram'], 0),
      quiz('igl-q7', 'igl-tests', 'A test case should include…', ['Input and expected result', 'Only a title', 'The developer’s name', 'A priority color'], 0),
    ],
  },
];

addVerifiedEvidence(demoModules);

export const catalog: CatalogProgram[] = [
  {
    id: 'esi-informatique', institution: 'ESI Algiers', title: 'Computer Science Engineering',
    modules: [
      { id: 'esi-alg1', title: 'Algebra 1', level: 'First preparatory year', ready: true, sourceUrl: algebraSyllabus },
      { id: 'esi-igl', title: 'Introduction to Software Engineering', level: 'Third year', ready: true, sourceUrl: iglSyllabus },
    ],
  },
  {
    id: 'usthb-informatique', institution: 'USTHB', title: 'Computer Science degree',
    modules: [
      { id: 'usthb-alg1', title: 'Algebra 1', level: 'First year', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/licence-syst%C3%A8mes-d%E2%80%99information-et-g%C3%A9nie-logiciel%20' },
      { id: 'usthb-poo', title: 'Object-oriented programming', level: 'Second year', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/Licence-Informatique' },
      { id: 'usthb-bdd', title: 'Databases', level: 'Second year', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/Licence-Informatique' },
    ],
  },
  {
    id: 'usthb-sigl', institution: 'USTHB', title: 'Information Systems and Software Engineering degree',
    modules: [
      { id: 'usthb-sigl-alg1', title: 'Algebra 1', level: 'First year', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/licence-syst%C3%A8mes-d%E2%80%99information-et-g%C3%A9nie-logiciel%20' },
      { id: 'usthb-sigl-algo', title: 'Programming and data structures', level: 'First year', ready: false, sourceUrl: 'https://finfo.usthb.dz/pages/licence-syst%C3%A8mes-d%E2%80%99information-et-g%C3%A9nie-logiciel%20' },
    ],
  },
  {
    id: 'enp-prepa', institution: 'ENP Algiers', title: 'Preparatory classes',
    modules: [
      { id: 'enp-alg1', title: 'Algebra 1', level: 'First year', ready: false, sourceUrl: 'https://elearning.cp.enp.edu.dz/?lang=fr' },
    ],
  },
  {
    id: 'enp-automatique', institution: 'ENP Algiers', title: 'Control Engineering',
    modules: [
      { id: 'enp-aut-av', title: 'Advanced control', level: 'Third year', ready: false, sourceUrl: 'https://www.enp.edu.dz/storage/2020/09/Programme-Ingenieur-Automatique-2015.pdf' },
    ],
  },
  {
    id: 'enp-dsia', institution: 'ENP Algiers', title: 'Data Science and Artificial Intelligence Engineering',
    modules: [
      { id: 'enp-dsia-programme', title: 'Curriculum', level: 'Engineering cycle', ready: false, sourceUrl: 'https://www.enp.edu.dz/storage/2022/03/Programme-Ingenieur-Data-Sscience-Intelligence-Artificielle-2020.pdf' },
    ],
  },
];
