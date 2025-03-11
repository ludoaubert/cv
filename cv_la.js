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
		('Maths', 'Graphs', 5),
		('Maths', 'Algebra', 4),
		('Maths', 'Statistics', 4),
		('Maths', 'Geometry', 3),
		('Tools', 'SQL Server', 6),
		('Tools', 'Web Browsers', 5),
		('Tools', 'PostgreSQL', 4),
		('Tools', 'PGLite', 4),
		('Tools', 'GIT', 4),
		('Tools', 'Oracle', 3),
		('Tools', 'NodeJS', 3),
		('Skills', 'Endurance', 6),
		('Skills', 'Curiosity', 6),
		('Skills', 'Persistence', 5),
		('Skills', 'Dependable', 5),
		('Skills', 'Vision', 4),
		('Skills', 'Research', 4),
		('Skills', 'Abstraction', 4),
		('Skills', 'Practical', 4),
		('Experience', 'Queries', 6),
		('Experience', 'Functional', 5),
		('Experience', 'Regression Monitoring', 5),
		('Experience', 'Information Structure', 4),
		('Experience', 'Multi Language', 4),
		('Experience', 'Integrity', 4),
		('Experience', 'Speed', 4),
		('International', 'Germany', 5),
		('International', 'USA', 4),
		('International', 'Switzerland', 3)
), cte_field_ AS (
	SELECT *, ROW_NUMBER() OVER() AS rn,
		ROW_NUMBER() OVER(PARTITION BY box_title) AS rn2
	FROM cte_field
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

	const ret = await db.query(`
		WITH cte_values(val) AS (
			VALUES(1),(2),(3),(4),(5),(6)
		), cte_field_(idbox, idfield, name, val, state) AS (
			SELECT idbox, idfield, name, val,
				CASE WHEN stars >=val THEN 'full' ELSE 'empty' END AS state
			FROM field
			CROSS JOIN cte_values
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
		SELECT STRING_AGG(FORMAT('<h2>%1$s</h2><table>%2$s</table>', UPPER(title), html), '\n<hr />\n' ORDER BY box.idbox) AS html
		FROM cte_box
		JOIN box ON box.idbox = cte_box.idbox
	`);

	document.getElementById("left-panel").innerHTML += ret.rows[0].html;
}
