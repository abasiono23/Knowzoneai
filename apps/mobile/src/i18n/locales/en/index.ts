import auth from './auth';
import billing from './billing';
import common from './common';
import courses from './courses';
import games from './games';
import help from './help';
import lab from './lab';
import space from './space';
import history from './history';
import quests from './quests';
import tech from './tech';
import business from './business';
import exams from './exams';
import reels from './reels';
import rooms from './rooms';
import home from './home';
import personalize from './personalize';
import referrals from './referrals';
import rewards from './rewards';
import settings from './settings';
import study from './study';
import teacher from './teacher';
import tutor from './tutor';
import videos from './videos';
import world from './world';

/** English is the source language: every key exists here, and other languages fall back to it. */
const en = { common, auth, personalize, home, tutor, study, videos, courses, world, games, lab, space, history, quests, tech, business, exams, reels, rooms, rewards, referrals, settings, billing, help, teacher };

export default en;
