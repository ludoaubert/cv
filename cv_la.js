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
`;

const data=`
INSERT INTO diagram(iddiagram, title) VALUES (1, 'CV Ludovic Aubert');

INSERT INTO tag(type_code, code) VALUES
('COLOR','yellow'),('COLOR','pink'),('COLOR','hotpink'),('COLOR','palegreen'),('COLOR','red'),('COLOR','orange'),('COLOR','skyblue'),('COLOR','olive'),('COLOR','grey'),('COLOR','darkviolet'),
('COLOR','lime'),('COLOR','fuchsia'),('COLOR','teal'),('COLOR','aqua'),('COLOR','aquamarine'),('COLOR','coral'),('COLOR','cornflowerblue'),('COLOR','darkgray'),('COLOR','darkkhaki'),
('COLOR','indianred'),('COLOR','indigo'),('COLOR','ivory'),('COLOR','khaki'),('COLOR','mediumorchid'),('COLOR','mediumpurple'),('COLOR','lawngreen'),('COLOR','lemonchiffon'),
('COLOR','lightblue'),('COLOR','lightcoral'),('COLOR','greenyellow'),('COLOR','lightgoldenrodyellow'),('COLOR','lightgray'),('COLOR','lightgreen'),('COLOR','lightgrey'),('COLOR','lightpink'),('COLOR','lightsalmon'),('COLOR','lightseagreen'),('COLOR','lightskyblue'),('COLOR','lightslategray'),
('COLOR','chartreuse'),('COLOR','DarkOrange'),('COLOR','BlueViolet'),('COLOR','MediumSeaGreen'),('COLOR','LightSeaGreen'),('COLOR','BurlyWood');


WITH cte(box_title, field_name, stars) AS (
	SELECT 'Languages', 'C++', 5 UNION ALL
	SELECT 'Languages', 'SQL', 5 UNION ALL
 	SELECT 'Languages', 'JSON', 4 UNION ALL
  	SELECT 'Languages', 'JS', 4 UNION ALL
	SELECT 'Languages', 'Html', 4 UNION ALL
	SELECT 'Languages', 'SVG', 4 UNION ALL
 	SELECT 'Languages', 'Css', 4 UNION ALL
	SELECT 'Languages', 'Python', 3 UNION ALL
	SELECT 'Languages', 'regexp', 5 UNION ALL
	SELECT 'Maths', 'Graphs', 5 UNION ALL
	SELECT 'Maths', 'Algebra', 4 UNION ALL
	SELECT 'Maths', 'Statistics', 4 UNION ALL
	SELECT 'Maths', 'Geometry', 3 UNION ALL
	SELECT 'Tools', 'SQL Server', 5 UNION ALL
	SELECT 'Tools', 'PostgreSQL', 4 UNION ALL
	SELECT 'Tools', 'PGLite', 4 UNION ALL
	SELECT 'Tools', 'Oracle', 3 UNION ALL
	SELECT 'Tools', 'NodeJS', 3 UNION ALL
	SELECT 'Tools', 'Web Browsers', 5 UNION ALL
	SELECT 'Tools', 'GIT', 4 UNION ALL
	SELECT 'Skills', 'Endurance', 5 UNION ALL
	SELECT 'Skills', 'Vision', 4 UNION ALL
	SELECT 'Skills', 'Persistence', 5 UNION ALL
	SELECT 'Skills', 'Research', 4 UNION ALL
	SELECT 'Skills', 'Curiosity', 5 UNION ALL
	SELECT 'Skills', 'Dependable', 5 UNION ALL
	SELECT 'Skills', 'Abstraction', 4 UNION ALL
	SELECT 'Skills', 'Practical', 4 UNION ALL
	SELECT 'Experience', 'Queries', 5 UNION ALL
	SELECT 'Experience', 'Functional', 4 UNION ALL
	SELECT 'Experience', 'Information Structure', 4 UNION ALL
	SELECT 'Experience', 'Multi Language', 4 UNION ALL
	SELECT 'Experience', 'Regression Monitoring', 5 UNION ALL
	SELECT 'Experience', 'Simplicity', 5 UNION ALL
	SELECT 'Experience', 'Integrity', 4 UNION ALL
	SELECT 'Experience', 'Speed', 4 UNION ALL
	SELECT 'International', 'USA', 4 UNION ALL
	SELECT 'International', 'Germany', 5 UNION ALL
	SELECT 'International', 'Switzerland', 3
), cte_box AS (
	INSERT INTO box(title)
	SELECT DISTINCT box_title
	FROM cte
	RETURNING *
)
INSERT INTO field(idbox, name, stars)
SELECT cte_box.idbox, cte.field_name, cte.stars
FROM cte
JOIN cte_box ON cte.box_title = cte_box.title;
`;

window.main = async function main()
{
	const rt1 = await db.exec(schema);
	const rt2 = await db.exec(data);

	const ret = await db.query(`
		WITH cte_values(val) AS (
			VALUES(1),(2),(3),(4),(5),(6)
		), cte_field(idbox, idfield, name, state) AS (
			SELECT *,
				CASE WHEN stars >=val THEN 'full' ELSE 'empty' END AS state
			FROM field
			CROSS JOIN cte_values
		), cte_field(idbox, idfield, name,  html) AS (
			SELECT idbox, idfield, name,
				STRING_AGG(FORMAT('<input type="checkbox" class="checkbox-round-%1$s" />', state), '\n' ORDER BY val) AS html
			FROM cte_field
			GROUP BY idbox, idfield, name
		), cte_box AS (
			SELECT idbox, STRING_AGG(FORMAT('<span>%1$s %2$s</span>', name, html) '\n' ORDER BY idfield) AS html
			FROM cte_field
			GROUP BY idbox
		)
		SELECT STRING_AGG(FORMAT('<h2>%1$s</h2>%2$s', title, html) '\n' ORDER BY idbox) AS html
		FROM cte_box
		JOIN box ON box.idbox = cte_box.idbox
	`);

	document.getElementById("left-panel").innerHTML = ret.rows[0].html;
}
