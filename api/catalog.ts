import type { CatalogProgram, ModuleData } from '../src/shared/types';

const algebraSyllabus = 'https://www.esi.dz/course/algebre/';
const iglSyllabus = 'https://www.esi.dz/course/introduction-au-genie-logiciel/';

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
    modules: [{ id: 'enp-alg1', title: 'Algebra 1', level: 'First year', ready: false, sourceUrl: 'https://elearning.cp.enp.edu.dz/?lang=fr' }],
  },
  {
    id: 'enp-automatique', institution: 'ENP Algiers', title: 'Control Engineering',
    modules: [{ id: 'enp-aut-av', title: 'Advanced control', level: 'Third year', ready: false, sourceUrl: 'https://www.enp.edu.dz/storage/2020/09/Programme-Ingenieur-Automatique-2015.pdf' }],
  },
  {
    id: 'enp-dsia', institution: 'ENP Algiers', title: 'Data Science and Artificial Intelligence Engineering',
    modules: [{ id: 'enp-dsia-programme', title: 'Curriculum', level: 'Engineering cycle', ready: false, sourceUrl: 'https://www.enp.edu.dz/storage/2022/03/Programme-Ingenieur-Data-Sscience-Intelligence-Artificielle-2020.pdf' }],
  },
];

export const initialModules: ModuleData[] = catalog.flatMap(program => program.modules.filter(item => item.ready).map(item => ({
  id: item.id,
  title: item.title,
  institution: program.institution,
  program: program.title,
  level: item.level,
  topics: [],
  occurrences: [],
  quiz: [],
  isDemonstration: false,
  updatedAt: new Date(0).toISOString(),
})));
