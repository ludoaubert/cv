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
  importance INTEGER,
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


WITH cte_field(box_title, field_name, importance) AS (
	SELECT 'Languages', 'C++', 35 UNION ALL
	SELECT 'Languages', 'SQL', 35 UNION ALL
 	SELECT 'Languages', 'JSON', 10 UNION ALL
  	SELECT 'Languages', 'JS', 30 UNION ALL
	SELECT 'Languages', 'Html', 10 UNION ALL
	SELECT 'Languages', 'SVG', 10 UNION ALL
 	SELECT 'Languages', 'Css', 10 UNION ALL
	SELECT 'Languages', 'Python', 5 UNION ALL
	SELECT 'Languages', 'regexp', 5 UNION ALL
	SELECT 'Maths', 'Graphs', 30 UNION ALL
	SELECT 'Maths', 'Algebra', 30 UNION ALL
	SELECT 'Maths', 'Statistics', 25 UNION ALL
	SELECT 'Maths', 'Geometry', 20 UNION ALL
	SELECT 'Tools', 'SQL Server', 40 UNION ALL
	SELECT 'Tools', 'PostgreSQL', 20 UNION ALL
	SELECT 'Tools', 'PGLite', 10 UNION ALL
	SELECT 'Tools', 'Oracle', 10 UNION ALL
	SELECT 'Tools', 'NodeJS', 20 UNION ALL
	SELECT 'Tools', 'Web Browsers', 30 UNION ALL
	SELECT 'Tools', 'GIT', 10 UNION ALL
	SELECT 'Skills', 'Endurance', 20 UNION ALL
	SELECT 'Skills', 'Vision', 15 UNION ALL
	SELECT 'Skills', 'Persistence', 30 UNION ALL
	SELECT 'Skills', 'Research', 30 UNION ALL
	SELECT 'Skills', 'Curiosity', 35 UNION ALL
	SELECT 'Skills', 'Dependable', 25 UNION ALL
	SELECT 'Skills', 'Abstraction', 20 UNION ALL
	SELECT 'Skills', 'Practical', 15 UNION ALL
	SELECT 'Experience', 'Queries', 30 UNION ALL
	SELECT 'Experience', 'Functional', 30 UNION ALL
	SELECT 'Experience', 'Information Structure', 30 UNION ALL
	SELECT 'Experience', 'Multi Language', 30 UNION ALL
	SELECT 'Experience', 'Regression Monitoring', 30 UNION ALL
	SELECT 'Experience', 'Simplicity', 30 UNION ALL
	SELECT 'Experience', 'Integrity', 30 UNION ALL
	SELECT 'Experience', 'Speed', 30 UNION ALL
	SELECT 'Education', 'Maths', 30 UNION ALL
	SELECT 'Education', 'Computer Science', 30 UNION ALL
	SELECT 'Education', 'Ecole Centrale', 30 UNION ALL
	SELECT 'International', 'USA', 20 UNION ALL
	SELECT 'International', 'Germany', 30 UNION ALL
	SELECT 'International', 'Switzerland', 15
), cte_field__ AS (
	SELECT *, ROW_NUMBER() OVER() AS rn
	FROM cte_field
), cte_field_ AS (
	SELECT *,ROW_NUMBER() OVER(PARTITION BY box_title) AS rn2
	FROM cte_field__
), cte_box AS (
	INSERT INTO box(title)
	SELECT box_title
	FROM cte_field_
	WHERE rn2=1
	ORDER BY rn
	RETURNING *
)
INSERT INTO field(idbox, name, importance)
SELECT cte_box.idbox, cte_field.field_name, cte_field.importance
FROM cte_field
JOIN cte_box ON cte_field.box_title = cte_box.title;
`;

window.main = async function main()
{
	const rt1 = await db.exec(schema);
	const rt2 = await db.exec(data);

	const Radius = 100;

	const ret = await db.query(`
		WITH cte AS (
			SELECT *, SUM(importance) OVER(PARTITION BY idbox ORDER BY idfield
				ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS running_total,
				SUM(importance) OVER(PARTITION BY idbox) AS total,
				ROW_NUMBER() OVER(PARTITION BY idbox ORDER BY idfield) AS idcolor
			FROM field
		), cte2 AS (
			SELECT *, (2*${Radius}*3.14*importance/total)::numeric(10,2) AS dasharray,
				(2*${Radius}*3.14*coalesce(running_total)/total)::numeric(10,2) AS dashoffset,
				importance * 100 / total AS percentage,
				(2*${Radius} + 1.5*${Radius}*cos((COALESCE(running_total,0)+importance/2)*2*3.14/total))::numeric(10,2) AS x,
				(2*${Radius} + 1.5*${Radius}*sin((COALESCE(running_total,0)+importance/2)*2*3.14/total))::numeric(10,2) AS y
			FROM cte
		), cte_split AS (
			SELECT idfield, x, unnest(string_to_array("name", ' ')) mot
			FROM cte2
		), cte3(idfield, html) AS (
			SELECT idfield, STRING_AGG(FORMAT('<tspan x="%1$s" dy="%2$s">%3$s</tspan>', x, '1.2em', mot), '')
			FROM cte_split
			GROUP BY idfield,x
		), cte4(idbox, "order", html) AS (
			SELECT idbox, 1, FORMAT('<svg id="svg%1$s" height="%2$s" width="%2$s">', idbox, '${4*Radius}')
			FROM box

			UNION ALL

			SELECT idbox, 2, FORMAT('
				<circle r="${Radius}" cx="${2*Radius}" cy="${2*Radius}"
        				stroke="%1$s"
					stroke-width="${2*Radius}"
        				stroke-dasharray="%2$s %3$s"
        				stroke-dashoffset="%4$s"/>',
				code, --%1
				dasharray, --%2
				(3.14*2*${Radius})::numeric(10,2), --%3
				-coalesce(dashoffset,0)) --%4
			FROM cte2
			JOIN tag ON type_code='COLOR' AND idcolor=idtag

			UNION ALL

			SELECT idbox, 3, FORMAT('<text x="%1$s" y="%2$s">%3$s</text>', cte2.x, y-20, cte3.html)
			FROM cte2
			JOIN cte3 ON cte3.idfield = cte2.idfield

			UNION ALL

			SELECT idbox, 4, FORMAT('<text x="%1$s" y="%1$s"><tspan x="%1$s" dy="%2$s">%3$s</tspan></text>', '${2*Radius}', '0.5em', title)
			FROM box

			UNION ALL

			SELECT idbox, 5, '</svg>'
			FROM box
		)
		SELECT STRING_AGG(html, '' ORDER BY idbox, "order") AS html
		FROM cte4
	`);

	document.body.innerHTML = ret.rows[0].html;
}
