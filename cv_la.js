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
  UNIQUE(iddiagram, type_code, code),
  FOREIGN KEY (iddiagram) REFERENCES diagram(iddiagram) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS achievement(
  idachievement SERIAL,
  iddiagram INTEGER DEFAULT 1,
  PRIMARY KEY (iddiagram, idachievement),
  entreprise VARCHAR(50),
  debut DATE,
  fin DATE,
  category VARCHAR(50),
  realisation VARCHAR,
  travail_confie VARCHAR,
  actions VARCHAR,
  resultats VARCHAR,
  headline VARCHAR(100),
  summary VARCHAR
);
`;

const data=`
INSERT INTO diagram(iddiagram, title) VALUES (1, 'CV Ludovic Aubert');

WITH cte(entreprise,debut,fin,category,realisation,travail_confie,actions,resultats,headline,summary) AS (
	SELECT 'Santarelli Group' AS entreprise,
		'2021-04-01'::date AS debut,
		'2025-03-01'::date AS fin,
		'data' AS category,
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
		AS resultats,
		'Patent database migration and merge'
		AS headline,
		'I performed the migration and merger of patent databases during '
		'a company acquisition, developing scripts and resolving critical issues. This initiative saved hundreds '
		'of thousands in cloud costs, streamlined data management, and supported the integration of three companies, '
		'valued in millions.'
		AS summary

	UNION ALL

	SELECT 'Paprec' AS entreprise,
		'2019-02-01'::date AS debut,
		'2020-06-01'::date AS fin,
		'data' AS category,
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
		'Plastic recycling plants traceability graph'
		AS headline,
		'I created a script to generate traceability graphs for six plastic recycling plants.'
		'After identifying a bug, I suggested rewriting the script, which was accepted, and I developed'
		'a more efficient version using advanced SQL features, resulting in a scalable solution'
		'that produced up to 6 million rows.'
		AS summary

	UNION ALL

		SELECT '' AS entreprise,
		'2024-07-27'::date AS debut,
		'2024-08-04'::date AS fin,
		'hobby' AS category,
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
		'Bike trip and camping: Paris to Barcelona, 8 days'
		AS headline,
		'A bike trip and camping journey from Paris to Barcelona in 8 days, initially planned'
		'by my son Edouard and his friends who later dropped out. I accompanied him, handling the camping gear,'
		'planning the route, and ensuring the trip ran smoothly within a budget of 10 euros per day.'
		AS summary

	UNION ALL

		SELECT 'Personal project' AS entreprise,
		'1996-03-11'::date AS debut,
		'2025-03-20'::date AS fin,
		'perso' AS category,
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
		'15-year algorithm development for database structure understanding'
		AS headline,
		'Over 15 years, I developed an algorithm to quickly understand database structures, initially conceived'
		'during an internship at EDF. Later, I refined this algorithm and expanded its capabilities,'
		'integrating various technologies like C++, PostgreSQL, and NodeJS to create an interactive web-based'
		'solution for visualizing data relationships.'
		AS summary

		UNION ALL

		SELECT 'Quantalys' AS entreprise,
		'2017-11-01'::date AS debut,
		'2018-04-30'::date AS fin,
		'software' AS category,
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
		'Designing scalable graphical interface for 60 life insurance fields'
		AS headline,
		'Design and development of a simple and scalable graphical interface to manage 60 fields for life insurance,'
		'replacing an overly complex, unmaintainable solution. The project took 3 months, saving 1 full-time year,'
		'with positive user feedback on its functionality.'
		AS summary

		UNION ALL

		SELECT 'Beatware' AS entreprise,
		'2000-09-01'::date AS debut,
		'2001-09-01'::date AS fin,
		'software' AS category,
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
		'Algorithm design for 2D data vectorization'
		AS headline,
		'I developed an algorithm in C++ to vectorize 2D graphical data, converting mouse-drawn points into Bézier curves'
		'while minimizing the number of curves and detecting shapes like polylines, polygons, and ellipses.'
		'The algorithm was successfully integrated into Beatware’s software, passed rigorous performance tests,'
		'and was later adopted by Oracle’s Hyperion after the acquisition in 2004.'
		AS summary

		UNION ALL

		SELECT 'AEG Zahler Gmbh' AS entreprise,
		'1996-10-01'::date AS debut,
		'1998-10-01'::date AS fin,
		'software' AS category,
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
		'2021-04-01'::date AS debut,
		'2025-03-01'::date AS fin,
		'data' AS category,
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
		'Patent inventor deduplication process'
		AS headline,
		'Developed a Python-based graph algorithm to deduplicate inventor data during patent migration, consolidating'
		'multiple records into a single inventor table. Successfully created a table with 16,000 unique inventors,'
		'improving data reliability.'
		AS summary

	UNION ALL

		SELECT 'Euronext' AS entreprise,
		'2015-12-01'::date AS debut,
		'2017-06-30'::date AS fin,
		'software' AS category,
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
		'Non-regression test portfolio using Google Tests'
		AS headline,
		'I developed a regression testing portfolio using Google Test for the Optiq project at Euronext, ensuring new'
		'features didn’t impact existing functionality. This initiative led to widespread adoption of automated unit and'
		'integration tests, contributing to the project’s success and timely delivery.'
		AS summary
)
INSERT INTO achievement(entreprise,debut,fin,category,realisation,travail_confie,actions,resultats,headline,summary)
SELECT *
FROM cte;


INSERT INTO tag(type_code, code) VALUES
('COLOR','yellow'),('COLOR','pink'),('COLOR','hotpink'),('COLOR','palegreen'),('COLOR','red'),('COLOR','orange'),('COLOR','skyblue'),('COLOR','olive'),('COLOR','grey'),('COLOR','darkviolet'),
('COLOR','lime'),('COLOR','fuchsia'),('COLOR','teal'),('COLOR','aqua'),('COLOR','aquamarine'),('COLOR','coral'),('COLOR','cornflowerblue'),('COLOR','darkgray'),('COLOR','darkkhaki'),
('COLOR','indianred'),('COLOR','indigo'),('COLOR','ivory'),('COLOR','khaki'),('COLOR','mediumorchid'),('COLOR','mediumpurple'),('COLOR','lawngreen'),('COLOR','lemonchiffon'),
('COLOR','lightblue'),('COLOR','lightcoral'),('COLOR','greenyellow'),('COLOR','lightgoldenrodyellow'),('COLOR','lightgray'),('COLOR','lightgreen'),('COLOR','lightgrey'),('COLOR','lightpink'),('COLOR','lightsalmon'),('COLOR','lightseagreen'),('COLOR','lightskyblue'),('COLOR','lightslategray'),
('COLOR','chartreuse'),('COLOR','DarkOrange'),('COLOR','BlueViolet'),('COLOR','MediumSeaGreen'),('COLOR','LightSeaGreen'),('COLOR','BurlyWood');


WITH cte_field(box_title, field_name, stars) AS (
	VALUES  ('Languages', 'C++', 6),
		('Languages', 'SQL', 6),
		('Languages', 'regexp', 5),
		('Languages', 'JS', 5),
 		('Languages', 'JSON', 4),
		('Languages', 'Html', 4),
		('Languages', 'SVG', 4),
 		('Languages', 'Css', 4),
		('Languages', 'Python', 3),
                ('Tools', 'SQL Server', 6),
                ('Tools', 'Web Browsers', 5),
                ('Tools', 'PostgreSQL', 4),
                ('Tools', 'PGLite', 4),
                ('Tools', 'GIT', 4),
                ('Tools', 'Oracle', 3),
                ('Tools', 'NodeJS', 3),
                ('Experience', 'Queries', 6),
                ('Experience', 'Functional', 5),
                ('Experience', 'Regression Monitoring', 5),
                ('Experience', 'Information Structure', 4),
                ('Experience', 'Multi Language', 4),
                ('Experience', 'Integrity', 4),
                ('Experience', 'Speed', 4),
		('Maths', 'Graphs', 5),
		('Maths', 'Algebra', 4),
		('Maths', 'Statistics', 4),
		('Maths', 'Geometry', 3),
		('Skills', 'Endurance', 6),
		('Skills', 'Curiosity', 6),
		('Skills', 'Persistence', 5),
		('Skills', 'Dependable', 5),
		('Skills', 'Vision', 4),
		('Skills', 'Research', 4),
		('Skills', 'Abstraction', 4),
		('Skills', 'Practical', 4),
		('International', 'Germany', 5),
		('International', 'USA', 4),
		('International', 'Switzerland', 3)
), cte_field__ AS (
	SELECT *, ROW_NUMBER() OVER() AS rn
	FROM cte_field
), cte_field_ AS (
	SELECT *,ROW_NUMBER() OVER(PARTITION BY box_title) AS rn2
	FROM cte_field__
),cte_box AS (
	INSERT INTO box(title)
	SELECT box_title
	FROM cte_field_
	WHERE rn2=1
	ORDER BY rn
	RETURNING *
)
INSERT INTO field(idbox, name, stars)
SELECT cte_box.idbox, cte_field.field_name, cte_field.stars
FROM cte_field
JOIN cte_box ON cte_field.box_title = cte_box.title;
`;

window.main = async function main()
{
	const rt1 = await db.exec(schema);
	const rt2 = await db.exec(data);
	const N=6;

	const ret3 = await db.query(`
		WITH cte_values(val) AS (
			VALUES(1),(2),(3),(4),(5),(6)
		), cte_field_(idbox, idfield, name, val, state) AS (
			SELECT idbox, idfield, name, val,
				CASE WHEN ${N}*stars/6 >=val THEN 'full' ELSE 'empty' END AS state
			FROM field
			CROSS JOIN cte_values
			WHERE val <= ${N}
		), cte_field(idbox, idfield, name,  html) AS (
			SELECT idbox, idfield, name,
				STRING_AGG(FORMAT('<td><input type="checkbox" class="checkbox-round-%1$s" /></td>', state), '\n' ORDER BY val) AS html
			FROM cte_field_
			GROUP BY idbox, idfield, name
		), cte_box AS (
			SELECT idbox, STRING_AGG(FORMAT('<tr><td>%1$s</td> %2$s</tr>', name, html), '\n' ORDER BY idfield) AS html
			FROM cte_field
			GROUP BY idbox
		)
		SELECT STRING_AGG(FORMAT('<h1>%1$s</h1><table>%2$s</table>', UPPER(title), html), '\n<hr />\n' ORDER BY box.idbox) AS html
		FROM cte_box
		JOIN box ON box.idbox = cte_box.idbox
	`);

	document.getElementById("left-panel").innerHTML += ret3.rows[0].html;

	const ret4 = await db.query(`
		WITH cte_achievements AS (
			SELECT *, ROW_NUMBER() OVER(PARTITION BY entreprise ORDER BY idachievement) AS rn,
				COUNT() OVER(PARTITION BY entreprise) AS nb,
				REPLACE(entreprise,' ','_') AS entreprise_
			FROM achievement
		), cte AS (
			SELECT headline,
				entreprise,
				CASE WHEN nb == 1
					THEN entreprise_
					ELSE entreprise_ || '_' || rn
				END AS id,
				category,
				debut,
				date_part('year', debut) AS annee_debut,
				fin,
				date_part('year', fin) AS annee_fin,
				summary
			FROM cte_achievement
		)
		SELECT STRING_AGG(FORMAT('
			<div id="%1$s" class="%2$s">
			  <h2>%3$s</h2>
			  <h3>%4$s <time datetime="%5$s">%6$s</time>-<time datetime="%7$s">%8$s</time></h3>
			  <p>%9$s</p>
			</div>
		',
			id, --%1
			category, --%2
			headline, --%3
			entreprise, --%4
			debut, --%5
			annee_debut, --%6
			fin, --%7
			annee_fin, --%8
			summary), --%8
			'<hr />\n' ORDER BY fin DESC) AS html
		FROM cte
	`);

	document.getElementById("achievements").innerHTML = ret4.rows[0].html;
	document.getElementById("hobby").innerHTML = ret4.rows[0].html;
}
