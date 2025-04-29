import { PGlite } from "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js";

const db = new PGlite();

const schema = `
CREATE TABLE IF NOT EXISTS diagram(
  iddiagram SERIAL PRIMARY KEY,
  uuid_diagram UUID DEFAULT gen_random_uuid(),
  title VARCHAR(128),
  UNIQUE(title),
  UNIQUE(uuid_diagram)
);

CREATE TABLE IF NOT EXISTS box(
  idbox SERIAL,
  title VARCHAR(128),
  iddiagram INTEGER DEFAULT 1,
  PRIMARY KEY (iddiagram, idbox),
  FOREIGN KEY (iddiagram) REFERENCES diagram(iddiagram) ON DELETE CASCADE,
  UNIQUE(iddiagram, title)
);

CREATE TABLE IF NOT EXISTS field(
  idfield SERIAL,
  iddiagram INTEGER DEFAULT 1,
  PRIMARY KEY (iddiagram, idfield),
  name VARCHAR(128),
  stars INTEGER,
  idbox INTEGER,
  FOREIGN KEY (iddiagram) REFERENCES diagram(iddiagram) ON DELETE CASCADE,
  FOREIGN KEY (iddiagram, idbox) REFERENCES box(iddiagram, idbox) ON DELETE CASCADE,
  UNIQUE(iddiagram, idbox, name),
  UNIQUE(iddiagram, idbox, idfield)
);

CREATE TABLE IF NOT EXISTS tag(
  idtag SERIAL,
  iddiagram INTEGER DEFAULT 1,
  PRIMARY KEY (iddiagram, idtag),
  type_code VARCHAR(128),
  code VARCHAR(128),
  libelle VARCHAR DEFAULT NULL,
  debut DATE DEFAULT NULL,
  fin DATE DEFAULT NULL,
  UNIQUE(iddiagram, type_code, code),
  FOREIGN KEY (iddiagram) REFERENCES diagram(iddiagram) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievement(
  idachievement SERIAL,
  iddiagram INTEGER DEFAULT 1,
  PRIMARY KEY (iddiagram, idachievement),
  entreprise VARCHAR(50),
  job_title VARCHAR(50),
  debut DATE,
  fin DATE,
  realisation VARCHAR,
  travail_confie VARCHAR,
  actions VARCHAR,
  resultats VARCHAR,
  headline VARCHAR(100),
  summary VARCHAR,
  FOREIGN KEY (iddiagram) REFERENCES diagram(iddiagram) ON DELETE CASCADE
);

`;

const data=`
INSERT INTO diagram(iddiagram, title) VALUES (1, 'CV Ludovic Aubert');

WITH cte(entreprise,job_title,debut,fin,realisation,travail_confie,actions,resultats,headline,summary) AS (
	SELECT 'Santarelli Group' AS entreprise,
		'Ingénieur Data et Logiciel' AS job_title,
		'2021-04-01'::date AS debut,
		'2025-03-01'::date AS fin,
		'Migration et fusion des bases de données des brevets'
		AS realisation,
		'dans le cadre d’un double rachat d’entreprises.'
		'La direction m’a demandé de migrer les données des brevets du système LOLA '
		'(utilisés par les deux entreprises rachetées) vers un système développé en interne.'
		'Elle voulait aussi fusionner les données des deux entreprises rachetées avec les leurs.'
		'Les données sont très critiques car on peut perdre des brevets.'
		AS travail_confie,
		'J’ai mis au point le script de migration des brevets. J’ai créé un script de fusion.'
		'J’ai créé une base de tests qui m’a permis de donner confiance aux utilisateurs'
		'et à la direction et de leur donner de la visibilité.'
		'J’ai fait tourner les scripts, en temps très contraint, pour réaliser les 2 migrations'
		'et les 2 merges. '
		'Pendant une de ces opérations, j’ai du vite analyser un problème bloquant imprévu et le débloquer en temps imparti.'
		AS actions,
		'L’entreprise a pu économiser les abonnements au cloud de l’ancien fournisseur, plusieurs centaines de milliers '
		'd’euros par an.'
		'En centralisant les données, elle réduisait les coûts de gestion pour environ 100 000 brevets '
		'et réduisait les risques d’erreur. '
		'La migration et la fusion des 3 bases de données matérialise la fusion des 3 sociétés avec un fonctionnement intégré.'
		'Cela peut se valoriser jusqu’à des millions d’euros.'
		'Migration aussi de 5 téraoctets de documents depuis Oracle vers le filesystem.'
		AS resultats,
		'Migration de schémas et fusion de base de données brevets'
		AS headline,
		'réduction coûts cloud de plusieurs centaines de milliers d’euros, intégration de 3 entreprises. A simplifié la gestion des données et a soutenu l’intégration de trois entreprises, d’une valeur de plusieurs millions.'
		AS summary
/*
		'J’ai effectué la migration vers un nouveau schéma et la fusion des bases de données de brevets lors d’une'
		' acquisition d’entreprise. Cette initiative a permis d’économiser plusieurs centaines de milliers de dollars en coûts cloud,'
		' a simplifié la gestion des données et a soutenu l’intégration de trois entreprises, d’une valeur de plusieurs millions.'
		AS summary
*/
	UNION ALL

	SELECT 'Paprec' AS entreprise,
		'Ingénieur Data et Logiciel' AS job_title,
		'2019-02-01'::date AS debut,
		'2020-06-01'::date AS fin,
		'création d’un script pour produire le graphe de traçabilité pour les 6 usines de recyclage de plastique'
		AS realisation,
		'Ma hiérarchie m’a demandé de corriger un bug sur le script pour produire le graphe de traçabilité. J’ai proposé '
		'de le réécrire complètement et ma hiérarchie a accépté.'
		AS travail_confie,
		'J’ai développé un nouveau script qui allait produire jusqu’à 6 millions de lignes pour la tracabilité les flux au sein '
		'd’une usine de recyclage de plastique.'
		'Pour ce faire, j’ai utilisé des fonctionnalités récentes du SQL qui permettaient de réaliser ce script de façon beaucoup '
		'plus simple et mathématique qu’avant'
		AS actions,
		'Le script a fonctionné sur les bases des 6 usines de recyclage de plastique.'
		'Sur la plus grosse base (6 millions de lignes produites), le script livré était évolutif'
		'et a permis de l’optimiser pour traiter plus rapidement les données'
		AS resultats,
		'Creation de graphes de tracabilité'
		AS headline,
		'J’ai créé un script pour générer des graphes de traçabilité pour six usines de recyclage de plastique.'
		' J’ai re-développé une version plus efficace et évolutive du script en utilisant des fonctionnalités avancées de SQL,'
		' ce qui a permis de produire jusqu’à 6 millions de lignes.'
		AS summary

	UNION ALL

		SELECT 'Paprec' AS entreprise,
		'Ingénieur Data et Logiciel' AS job_title,
               '2019-02-01'::date AS debut,
                '2020-06-01'::date AS fin,
                '' AS realisation,
                '' AS travail_confie,
                '' AS actions,
                '' AS resultats,
                'Flexible HR database with tracking'
                AS headline,
		'Conception de zéro d’une base de données de motivation et de suivi pour les RH. En raison de l’intégration de COVED,'
		' PAPREC nécessite une conception de base de données plus flexible. Conception d’un prototype de test pour valider la'
		' structure. Intégration des traceurs de congés payés avec un enregistrement sur 3 ans.'
		AS summary

	UNION ALL

		SELECT 'Paprec' AS entreprise,
		'Ingénieur Data et Logiciel' AS job_title,
               '2019-02-01'::date AS debut,
                '2020-06-01'::date AS fin,
                '' AS realisation,
                '' AS travail_confie,
                '' AS actions,
                '' AS resultats,
                'ELT pour des données geographiques massives'
                AS headline,
		'Paprec ESRI Geographic Data Hub. Développement d’un processus ELT (SQL+Python) pour transférer des gigaoctets de données '
		'hébergées par divers fournisseurs tels que Kizeo, Novacom, Simpliciti, Sigrenea pour Paprec dans une base de données '
		'géographique on premise.'
		AS summary

	UNION ALL

		SELECT 'Bikepacking' AS entreprise,
		'' AS job_title,
		'2024-07-27'::date AS debut,
		'2024-08-04'::date AS fin,
		'trajet en vélo et camping pour relier Paris à Barcelone en 8 jours'
		AS realisation,
		'Mon fils Edouard, 20 ans , qui sort de prépa, a prévu ce voyage avec des copains qui ont abandonné.'
		'Je l’accompagne donc. Faire Paris Barcelone en transportant le matériel de camping.'
		'La date d’arrivée est contrainte car il y a une réunion de famille prévue dans ma belle famille à Barcelone'
		AS travail_confie,
		'J’ai préparé du matériel et utilisé des applications pour trouver en temps réel ce dont on a besoin'
		'(nourriture, camping, hôtel, eau, itinéraire, énergie)'
		'J’ai soutenu mon fils pour atteindre l’objectif ensemble.'
		AS actions,
		'Pas d’imprévu technique.'
		'Bonne optimisation du trajet parcouru. Rythme de croisière de 120 km parcourus par jour.'
		'Budget: environ 10 euros par jour.'
		'Nous avons toujours été en sécurité.'
		AS resultats,
		'Voyage en vélo et camping'
		AS headline,

		'Paris-Barcelone en 8 jours (logistique, autonomie, planification)'
		AS summary
/*
		'J’ai accompagné mon fils, en roulant 120 km par jour, en planifiant l’itinéraire et en veillant à ce que le voyage'
		' se déroule sans accroc avec un budget de 10 euros par jour.'
		AS summary
*/
	UNION ALL

		SELECT 'Personal project' AS entreprise,
		'' AS job_title,
		'1996-03-11'::date AS debut,
		'2025-03-20'::date AS fin,
		'conception sur 15 ans d’un algorithme pour comprendre rapidement la structure d’une base de données'
		AS realisation,
		'Projet perso de création d’un produit en ligne à base d’algorithmes'
		'À l’issue du stage de fin d’étude de mars à Juillet 1996 chez EDF, j’ai envie d’approfondir un sujet'
		'qui me paraissait inachevé.'
		'Initiative personnelle d’approfondir un sujet et un besoin ressenti au fur et à mesure de mon parcours professionnel.'
		'Le stage portait sur le désign d’un algorithme pour tracer des liens graphiques sur un diagramme'
		'affichant des blocs fonctionnels sous forme de rectangles.'
		'Cet algorithme allait être intégré dans un logiciel de CAO pour le design du contrôle'
		'commande des centrales nucléaires.'
		'Un lien graphique doit:'
		'suivre une géométrie Manhattan (segments nord-sud et est-ouest).'
		'éviter les rectangles.'
		'minimiser les tournants.'
		'avoir une longueur minimale.'
		'essayer de joindre les centres des côtés des rectangles source et destination.'
		'éviter de croiser les autres liens.'
		'Il faut créer 2 autres modules:'
		'Étant donné une liste de rectangles et une liste de liens logiques, regrouper les rectangles par clusters.'
		'Pour chaque cluster, positionner les rectangles pour minimiser les longueurs des liens.'
		AS travail_confie,
		'J’avais implémenté l’algorithme du plus court chemin lors de mon stage et chez Beatware.'
		'Pendant mon stage, je croyais qu’il était impossible de faire modifier le coût des liens'
		' d’un graphe par l’algorithme lui-même. Cela aurait été utile pour appliquer une pénalité lors d’un virage.'
		'J’avais été obligé d’utiliser un graphe plus complexe, en imaginant des routes nord-sud et est-ouest reliées'
		'par des ascenseurs.'
		'En y réfléchissant vers 2012, j’ai appris qu’il était en réalité possible de faire modifier le coût des liens'
		'd’un graphe par l’algorithme lui-même.'
		'J’ai implémenté l’algorithme mis au point lors de mon stage chez EDF en C++ de manière plus simple.'
		'J’ai fait des recherches et j’ai appris qu’un mathématicien appelé Lanczos avait inventé une méthode'
		'matricielle avec des vecteurs propres pour calculer les clusters d’un graphe.'
		'J’ai aussi appris d’un autre consultant au travail qu’il existait un excellent module de calcul algébrique'
		'en C++ appelé Eigen.'
		'J’ai développé le module de clustering en utilisant un solveur de Lanczos avec Eigen en C++.'
		'J’ai imaginé un algorithme pour positionner les rectangles en m’inspirant de la façon dont s’enroule'
		'une coquille d’escargot.'
		'J’ai développé un algorithme relativement simple en C++.'
		'Lors de ma mission chez Cap Gemini en 2014, j’ai utilisé ces algorithmes pour'
		'produire une cartographie en HTML/SVG des tables du système dont je supervisais les opérations.'
		'A l’époque les algorithmes étaient déployés sur un Raspberry Pi utilisé comme serveur.'
		'La cartographie en HTML n’était pas interactive. Pas de recalcul de liens, de repositionnement de boite…'
		'Vers 2020, j’ai recompilé les algorithmes en Web Assembly afin de faciliter le déploiement et de rendre'
		'le HTML interactif.'
		'J’ai développé un site Web  afin de pouvoir opérer les algorithmes depuis le navigateur.'
		'J’ai utilisé Github pour développer et déployer le site, ainsi que pour ne pas perdre le code.'
		'2024-2025: J’ai développé de nouveau le site Web en utilisant la base de données embarquée dans le navigateur PGLite.'
		'J’ai créé un serveur de base de données afin de pouvoir sauvegarder les données de plusieurs utilisateurs.'
		'Le fait d’avoir utilisé PGLite facilitait beaucoup cette étape.'
		'J’ai également utilisé PostgreSQL et NodeJS ce qui m’a permis de monter en compétences sur ces technologies.'
		'2024-2025: J’ai mis à jour le code C++ pour le mettre au standard C++23.'
		'2024-2025: j’ai beaucoup amélioré le design de l’algorithme de tracé de lien, en ajoutant un algorithme'
		'pour minimiser les croisements entre liens, ce qu’il ne pouvait pas faire auparavant.'
		'Pour ce faire, j’ai découvert de nouvelles possibilités offertes par la modification du coût des liens'
		'd’un graphe par l’algorithme lui-même (mentionné au début)'
		AS actions,
		'J’utilise moi-même le produit pour comprendre rapidement comment sont organisées des informations chez un client.'
		'Gain de temps. Cela prend 2 heures pour produire une cartographie des structures de données d’un client,'
		'contre parfois plusieurs semaines pour être opérationnel.'
		'J’ai partagé des questions/réponses sur le forum stackoverflow et atteint un niveau de réputation de 10k.'
		'Présentation du retour d’expérience sur l’utilisation de PGLite au Meetup PostgreSQL Paris le 13 Mars 2025.'
		'Acquisition de compétences technologiques de pointe sur les langages (C++, SQL, JS, HTML, SVG, CSS),'
		' les produits (PostgreSQL, PGLite, NodeJS) et en algorithmique.'
		AS resultats,
		'developpement d’algorithmes pour cartographier des structures de données complexes'
		AS headline,
		'J’ai développé un algorithme permettant de comprendre rapidement les structures de bases de données, initialement conçu '
		' lors d’un stage chez EDF. Par la suite, j’ai affiné cet algorithme et élargi ses fonctionnalités, en intégrant diverses '
		' technologies telles que C++, PostgreSQL et NodeJS pour créer une solution interactive basée sur le web.'
		AS summary

		UNION ALL

		SELECT 'Quantalys' AS entreprise,
		'Développeur Fullstack' AS job_title,
		'2017-11-01'::date AS debut,
		'2018-04-30'::date AS fin,
		'conception/réalisation d’une manière simple et évolutive d’une interface graphique gérant 60 champs pour les assurances vies'
		AS realisation,
		'On me confie la création d’une interface graphique pour gérer des données sur les assurances vies.'
		'Il existe déjà une solution développée précédemment, mais elle est trop complexe et donc impossible'
		'à faire évoluer et à maintenir'
		AS travail_confie,
		'J’ai séparé la partie édition localement et la partie synchronisation avec la base de données.'
		'J’ai utilisé et complété un module de code qui existait déjà dans l’entreprise pour synchroniser les données.'
		AS actions,
		'le développement a duré seulement 3 mois tandis que celui qu’avait réalisé mon prédécesseur avait duré plus'
		'de 6 mois et n’était ni simple, ni  maintenable ni évolutif.'
		'On a gagné 1 homme année.'
		'Une des utilisatrices m’a donné un feedback très positif sur le fonctionnement de l’outil.'
		AS resultats,
		'Design d’une interface flexible pour editer 60 champs'
		AS headline,
		'Conception et développement (SQL, C++) d’une interface graphique simple et évolutive pour gérer 60 champs d’assurance vie, '
		' remplaçant une solution trop complexe et difficile à maintenir. Le projet a duré 3 mois, permettant d’économiser '
		' l’équivalent d’une année de travail, avec des retours positifs des utilisateurs fonctionnalité.'
		AS summary

		UNION ALL

		SELECT 'Beatware' AS entreprise,
		'C++ developer' AS job_title,
		'2000-09-01'::date AS debut,
		'2001-09-01'::date AS fin,
		'conception d’un algorithme pour vectoriser des données graphiques en dimension deux'
		AS realisation,
		'Beatware édite un logiciel pour créer des animations Web.'
		'On me confie la création d’un algorithme qui doit:'
		'1)Convertir une liste de points en dimension deux tracés avec la souris sur un écran en une liste de courbes de Béziers.'
		'2) Minimiser le nombre de courbes de Béziers (smoothing).'
		'3)Suivant les cas, détecter des polylines, des polygones ou des ellipses.'
		'L’étape 3) requiert que les étapes 1) et 2) soient très fiables et précises.'
		'Le tout doit être implémenté en C++ à partir d’une feuille blanche et être performant.'
		AS travail_confie,
		'J’ai recherché et effectué une analyse bibliographique pour trouver des algorithmes répondant au besoin.'
		'J’ai recherché parmi les algorithmes et les notions mathématiques que je connaissais ceux qui étaient'
		'les plus pertinents pour résoudre le problème'
		'J’ai pris l’initiative de recopier les algorithmes à partir d’un manuel du MIT et les adapter en C++ à défaut'
		'de librairie qui n’existait pas à l’époque.'
		'J’ai implémenté des algorithmes en C++ et mis au point des jeux de données de test.'
		'J’ai effectué des itérations de tests, développement et amélioration.'
		AS actions,
		'Mon algorithme a été testé et intégré au produit de Beatware.'
		'Il a subi avec succès un test  de performance très intense réalisé par ma hiérarchie.'
		'En 2004, Beatware a été racheté par la branche Business Intelligence de Oracle (Hyperion).'
		AS resultats,
		'Conception d’un algorithme pour la visualisation en 2D'
		AS headline,
		'I developed an algorithm in C++ to vectorize 2D graphical data, converting mouse-drawn points into Bézier curves'
		'while minimizing the number of curves and detecting shapes like polylines, polygons, and ellipses.'
		'The algorithm was successfully integrated into Beatware’s software, passed rigorous performance tests,'
		'and was later adopted by Oracle’s Hyperion after the acquisition in 2004.'
		AS summary

		UNION ALL

		SELECT 'AEG Zahler Gmbh' AS entreprise,
		'C++ developer' AS job_title,
		'1996-10-01'::date AS debut,
		'1998-10-01'::date AS fin,
		'conception d’un petit compilateur embarqué pour compteur électrique'
		AS realisation,
		'Racheté par Schlumberger pour lequel je suis en CSNE'
		'On me confie la création d’un compilateur pour permettre d’exprimer la valeur d’output en fonction d’input'
		'pour les compteurs électriques de manide manière flexible et modifiable à distance.'
		'On veut aussi comprimer ces expressions au maximum car il y a peu de mémoire disponible.'
		AS travail_confie,
		'J’ai modélisé les expressions avec différentes structures de données.'
		'J’ai testé différentes structures d’arborescences et sélectionné celle qui était la plus appropriée.'
		'J’ai implémenté la solution en C++.'
		'J’ai créé des jeux de données pour tester et valider la solution.'
		'J’ai créé une présentation pour communiquer la solution au Management'
		AS actions,
		'J’ai pu présenter ma solution opérationnelle devant le directeur de la R&D en Allemagne.'
		'Ces algorithmes ont permis de paramétrer de façon flexible des millions de compteurs électriques de nouvelle génération.'
		AS resultats,
		'Embedded compiler design for electric meter'
		AS headline,
		'Designed an embedded compiler for electric meters, allowing flexible and remotely modifiable output expressions'
		'based on inputs. The solution, implemented in C++, optimized memory usage and enabled the configuration of millions'
		'of next-gen meters, successfully presented to R&D management.'
		AS summary

	UNION ALL

		SELECT 'Santarelli Group' AS entreprise,
		'Ingénieur Data et Logiciel' AS job_title,
		'2021-04-01'::date AS debut,
		'2025-03-01'::date AS fin,
		'déduplication des inventeurs des brevets'
		AS realisation,
		'Dans le cadre de la migration des données des brevets, dans le système source LOLA, il n’y a pas de table'
		'des inventeurs. Les informations sur les inventeurs sont dupliquées, avec de petites erreurs ou de petits'
		'changements (n lignes par inventeur). Il faut donc dédupliquer ces informations pour créer une table des inventeurs'
		'(1 ligne par inventeur).'
		AS travail_confie,
		'J’ai mis au point un algorithme de graphes avec un nœud par ligne et des connexions entre les lignes lorsque'
		'le nom et le dossier sont identiques.'
		'J’ai codé un algorithme simple en python pour calculer les composantes connexes. Une composante connexe correspondait'
		'à un inventeur'
		AS actions,
		'Cet algorithme a été utilisé avec succès pour la migration des données de brevets.'
		'Une table avec 16000 inventeurs a été créée.'
		'La table a permis de fiabiliser la gestion des inventeurs'
		AS resultats,
		'Conception d’un processus de déduplication'
		AS headline,
		'Développement en Python d’un algorithme de déduplication pour 16 000 inventeurs.'
		AS summary
/*
		'Développement en Python d’un algorithme pour dédupliquer les données des inventeurs lors de la migration des brevets, '
		' consolidant plusieurs enregistrements en une seule table des inventeurs. Création réussie d’une table avec 16 000 '
		' inventeurs uniques, améliorant ainsi la fiabilité des données.'
		AS summary
*/
	UNION ALL

               SELECT 'Santarelli Group' AS entreprise,
		'Ingénieur Data et Logiciel' AS job_title,
		'2021-04-01'::date AS debut,
		'2025-03-01'::date AS fin,
		'' AS realisation,
		'' AS travail_confie,
		'' AS actions,
		'' AS resultats,
		'Extraction de 4 million de documents'
		AS headline,
		'Extraction de 4 millions de documents depuis Oracle → scripts automatisés (SQL).'
		AS summary
/*
		'J’ai rédigé des scripts et exécuté l’extraction de 4 To de documents d’archives d’entreprise depuis Oracle (fichiers '
		' stockés dans la base de données) vers des fichiers.'
		AS summary
*/
	UNION ALL

		SELECT 'Santarelli Group' AS entreprise,
		'Ingénieur Data et Logiciel' AS job_title,
		'2021-04-01'::date AS debut,
		'2025-03-01'::date AS fin,
		'' AS realisation,
		'' AS travail_confie,
		'' AS actions,
		'' AS resultats,
		'developpement d’un module en C++' AS headline,
		'Développement C++ d’un module structurant les documents légaux selon les paramètres brevets.'
		AS summary
/*
		'Développement en C++ d’une fonctionnalité permettant de créer une structure de répertoires pour stocker des documents '
		' légaux. La structure dépend d’un ensemble de paramètres spécifiques à un brevet.'
		AS summary
*/
	UNION ALL

		SELECT 'Santarelli Group' AS entreprise,
		'Ingénieur Data et Logiciel' AS job_title,
		'2021-04-01'::date AS debut,
		'2025-03-01'::date AS fin,
		'' AS realisation,
		'' AS travail_confie,
		'' AS actions,
		'' AS resultats,
		'Développement d’un prototype d’interface web' AS headline,
		'Création d’une interface web prototype (NodeJS, SQL JSON) pour la navigation base brevets'
		AS summary
/*
		'Création d’un proof of concept utilisant NodeJS et les nouvelles fonctionalités SQL JSON pour naviguer dans la base de données '
		' des brevets via un navigateur web. Développement rapide d’un prototype.'
		AS summary
*/
	UNION ALL

		SELECT 'Euronext' AS entreprise,
		'Ingénieur C++ et Tests' AS job_title,
		'2015-12-01'::date AS debut,
		'2017-06-30'::date AS fin,
		'initiation d’un portefeuille de tests de non régression en utilisant l’outil google tests'
		AS realisation,
		'dans le cadre du méga projet Optiq de Euronext (environ 100 home années), refonte complète du système'
		'de la bourse de Paris.'
		'Dans le cadre de ce méga projet en C++, il est vital de pouvoir s’assurer en temps réel que l’on ne casse'
		'pas des fonctionnalités déjà développées lorsqu’on en créé de nouvelles'
		AS travail_confie,
		'J’ai utilisé l’outil minimaliste en ligne de commande google test pour développer en C++ les premiers tests'
		'unitaires automatisés de non régression sur le périmètre de mon équipe.'
		'J’ai également créé des tests d’intégration avec le même outil.'
		AS actions,
		'Non seulement l’équipe dont je faisais partie, mais également toutes les autres équipes (environ 50 consultants)'
		'se sont mises à  développer ces portefeuilles de test (tests unitaires et test d’intégration).'
		'Cela a énormément contribué à la réussite du projet Optiq ainsi qu’à la tenue des délais et même à la santé'
		'mentale des équipes'
		AS resultats,
		'Développement d’un portefeuille de tests de non-regression'
		AS headline,
		'J’ai développé un portefeuille de tests de régression en utilisant Google Test pour le projet Optiq. Cette initiative a conduit'
		' à une adoption généralisée des tests automatisés, contribuant ainsi au succès du projet et à sa livraison dans les délais.'
		AS summary

		UNION ALL

		SELECT 'Euronext' AS entreprise,
		'Ingénieur C++ et Tests' AS job_title,
		'2015-12-01'::date AS debut,
		'2017-06-30'::date AS fin,
		'' AS realisation,
                '' AS travail_confie,
                '' AS actions,
                '' AS resultats,
		'Developpement de 3 modules en C++'
		AS headline,
		'Conception de 3 modules C++ (MDSpyReader, déduplication UDP, shaping) intégrés dans l’infrastructure Optiq'
		AS summary
/*
		'J’ai développé 3 sous-modules pour le module MDSpy du projet phare Optiq : '
    		'1-MDSpyReader : application qui écoute ce que les clients reçoivent et le persiste dans Kafka.'
    		'2-Déduplication : déduplication des données de marché envoyées sur 2 lignes physiques indépendantes.'
		'3-Implémentation et test d’un algorithme de contrôle de flux UDP (shaping).'
		AS summary
*/
)
INSERT INTO achievement(entreprise,job_title,debut,fin,realisation,travail_confie,actions,resultats,headline,summary)
SELECT *
FROM cte;


WITH cte (type_code,code,libelle) AS (
	SELECT 'PITCH' AS type_code,
		'senior_software_engineer' AS code,
		'Ingénieur diplômé de l’École Centrale Paris, je combine 25 ans d’expérience en développement logiciel, traitement de données, et conception d’architectures robustes. Mon parcours couvre le développement C++, l’ingénierie de données, le SQL avancé, le prototypage web, et l’optimisation des performances. Je recherche des projets complexes et critiques impliquant ces technologies.' AS libelle
/*
		'Diplômé de l’École Centrale, je combine une solide formation en mathématiques avec 25 ans '
		' d’expérience dans des projets diversifiés de logiciels et de data. '
		' Au début de ma carrière, j’ai principalement travaillé sur des projets en C++, dont certains nécessitaient la conception d’algorithmes.'
		' Dans un deuxième temps, sur des projets liés aux données. '
		' Je suis à la recherche de projets complexes et critiques, utilisant un mélange de données, de logiciels et de web.'
		AS libelle
*/
	UNION ALL

	SELECT 'PITCH' AS type_code,
		'full_stack' AS code,
		'I hold an Engineering degree from the Ecole Centrale in Paris and combine a strong background in Mathematics'
		'with 25 years of experience working on diversified software and data projects.'
		'In the first period of my career, I mostly worked on C++ projects, some of which required algorithmic design.'
		'In the second period, I mostly worked on Data projects. I am looking for complex and critical projects'
		'using a mix of data, software and web technologies.'
		AS libelle

	UNION ALL

	SELECT 'PITCH' AS type_code,
		'software' AS code,
		'I hold an Engineering degree from the Ecole Centrale in Paris and combine a strong background in Mathematics'
		'with 25 years of experience working on diversified software and data projects.'
		'In the first period of my career, I mostly worked on C++ projects, some of which required algorithmic design.'
		'In the second period, I mostly worked on Data projects. Now is an exciting time, as the shift to functional programming'
		'and queries mean that Mathematics and Software/Data Engineering are converging more than ever before.'
		'It would be an exciting time for me to go back to C++, but I am also interested by complex and critical data engineering projects'
		'and web technologies.'
		AS libelle

	UNION ALL

	SELECT 'PITCH' AS type_code,
		'data' AS code,
		'I combine a strong background in Mathematics with 15 years of experience working on diversified data projects.'
		'Now is an exciting time, as the shift to advanced queries with modern SQL mean that Mathematics and Data Engineering'
		'are converging more than ever before. I am very interested by complex and critical data engineering projects and web technologies.'
		AS libelle

	UNION ALL

	SELECT 'CONTACT' AS type_code,
		'mailto:EMAIL' AS code,
		'ludo.aubert@gmail.com' AS libelle

	UNION ALL

	SELECT 'CONTACT' AS type_code,
		'tel:+33-6-68-40-98-26' AS code,
		'(+33) 06 68 40 98 26' AS libelle

	UNION ALL

	SELECT 'LINK' AS type_code,
		'stackoverflow.com/ludovic-aubert' AS code,
		'https://stackoverflow.com/users/3046585/ludovic-aubert'
		AS libelle

	UNION ALL

	SELECT 'LINK' AS type_code,
		'github.com/ludoaubert' AS code,
		'https://github.com/ludoaubert'
		AS libelle

	UNION ALL

	SELECT 'LINK' AS type_code,
		'ludoaubert.github.io' AS code,
		'https://ludoaubert.github.io/pglite-linkedboxdraw/table_edit_ti.html'
		AS libelle

	UNION ALL

	SELECT 'LINK' AS type_code,
		'www.linkedin.com/ludovic-aubert' AS code,
		'https://www.linkedin.com/in/ludovic-aubert-831bb875/'
		AS libelle

	UNION ALL

	SELECT 'LINK' AS type_code,
		'cv détaillé' AS code,
		'https://docs.google.com/document/d/1yZ_4XxycUee3KCFx05UK89hRCZmEOxVz30StJLCe6OI/edit?tab=t.0'
		AS libelle

	UNION ALL

	SELECT 'HEADLINE' AS type_code,
		'senior_software_engineer' AS code,
		'Senior Software Engineer - Data, Backend, C++, Cloud'
		AS libelle

	UNION ALL

	SELECT 'HEADLINE' AS type_code,
		'full_stack' AS code,
		'Full Stack Engineer'
		AS libelle

	UNION ALL

	SELECT 'HEADLINE' AS type_code,
		'software' AS code,
		'Senior Software Engineer with strong C++ and SQL'
		AS libelle

	UNION ALL

	SELECT 'HEADLINE' AS type_code,
		'data' AS code,
		'Senior Data Engineer with strong SQL skills'
		AS libelle
)
INSERT INTO tag(type_code, code, libelle)
SELECT * FROM cte
;

WITH cte(type_code,code,libelle,debut,fin) AS (
	SELECT 'EDUCATION' AS type_code,
		'Ecole Centrale Paris' AS code,
		'Diplôme d’ingénieur, spécialité Informatique et Électronique' AS libelle,
		TO_DATE('1992-09-01','YYYY-MM-DD') AS debut,
		TO_DATE('1996-06-30','YYYY-MM-DD') AS fin

	UNION ALL

	SELECT 'EDUCATION' AS type_code,
		'Lycee Sainte Genevieve' AS code,
		'Classe Préparatoires Math Sup/Math Spé' AS libelle,
		TO_DATE('1990-09-01','YYYY-MM-DD') AS debut,
		TO_DATE('1992-06-30','YYYY-MM-DD') AS fin
)
INSERT INTO tag(type_code, code, libelle, debut, fin)
SELECT * FROM cte;
`;

window.main = async function main()
{
	const rt1 = await db.exec(schema);
	const rt2 = await db.exec(data);

	const ret4 = await db.query(`
		WITH cte_achievement AS (
			SELECT *, ROW_NUMBER() OVER(PARTITION BY entreprise ORDER BY idachievement) AS rn,
				COUNT(*) OVER(PARTITION BY entreprise) AS nb,
				REPLACE(entreprise,' ','_') AS entreprise_
			FROM achievement
		), cte AS (
			SELECT headline,
				entreprise,
				entreprise_,
				job_title,
				CASE WHEN nb = 1
					THEN entreprise_
					ELSE entreprise_ || '_' || rn
				END AS id,
				debut,
				date_part('year', debut) AS annee_debut,
				fin,
				date_part('year', fin) AS annee_fin,
				summary,
				rn,
				nb
			FROM cte_achievement
		)
		SELECT STRING_AGG(FORMAT('
			<div id="%1$s" class="%12$s">
			  <h3 id="%1$s" class="job%10$s">%3$s - %4$s - <time datetime="%5$s">%6$s</time>-<time datetime="%7$s">%8$s</time></h3>
			  <h4>%2$s</h4>
			  <p>%9$s</p>
			  <hr id="%1$s" class="job%11$s"/>
			</div>
			',
			id, --%1
			headline, --%2
			entreprise, --%3
			job_title, --%4
			debut, --%5
			annee_debut, --%6
			fin, --%7
			annee_fin, --%8
			summary, --%9
			rn, --%10
			nb-rn-1, --%11
			entreprise_), --%12
			'\n' ORDER BY fin DESC, id) AS html
		FROM cte
	`);

	document.getElementById("achievements").innerHTML = ret4.rows[0].html;
	document.getElementById("hobby").innerHTML = ret4.rows[0].html;
	document.getElementById("personal-project").innerHTML = ret4.rows[0].html;

	const ret5 = await db.query(`
		SELECT STRING_AGG(FORMAT('<p id="pitch_%1$s" class="%1$s">%2$s</p>',code,libelle),'\n' ORDER BY idtag) AS html
		FROM tag
		WHERE type_code = 'PITCH'
	`);
	document.getElementById("pitch").innerHTML = ret5.rows[0].html;

	const ret6 = await db.query(`
		SELECT STRING_AGG(FORMAT('<a href="%1$s">%2$s</a>',code, libelle),'\n' ORDER BY idtag) AS html
		FROM tag
		WHERE type_code = 'CONTACT'
	`);
	document.getElementById("contacts").innerHTML = ret6.rows[0].html;

	const ret7 = await db.query(`
		SELECT STRING_AGG(FORMAT('<a href="%1$s">%2$s</a>',libelle,code),'\n' ORDER BY idtag) AS html
		FROM tag
		WHERE type_code = 'LINK'
	`);
	document.getElementById("links").innerHTML = ret7.rows[0].html;

	const ret8 = await db.query(`
		SELECT STRING_AGG(FORMAT('<h1 id="headline_%1$s" class="%1$s">%2$s</h1>',code,libelle),'\n' ORDER BY idtag) AS html
		FROM tag
		WHERE type_code = 'HEADLINE'
	`);
	document.getElementById("headline").innerHTML = ret8.rows[0].html;

	const ret9 = await db.query(`
		WITH cte AS (
			SELECT idtag, libelle, code,
				FORMAT('<time datetime="%1$s">%2$s</time>', to_char(debut, 'YYYY-MM-DD'), date_part('year', debut)) AS debut,
				FORMAT('<time datetime="%1$s">%2$s</time>', to_char(fin, 'YYYY-MM-DD'), date_part('year', fin)) AS fin
			FROM tag
			WHERE type_code='EDUCATION'
		), cte2(idtag, idx, content) AS (
			SELECT idtag, 1, libelle FROM cte
			UNION ALL
			SELECT idtag, 2, FORMAT('%1$s %2$s - %3$s',code, debut,fin) FROM cte
		)
		SELECT '<table>' || STRING_AGG(FORMAT('<tr><td>%1$s</td></td>', content), '\n' ORDER BY idtag, idx) || '</table>' AS html
		FROM cte2
	`);
	document.getElementById("education").innerHTML = ret9.rows[0].html;
}
