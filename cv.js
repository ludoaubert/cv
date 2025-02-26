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
('COLOR','lightblue'),('COLOR','lightcoral'),('COLOR','greenyellow'),('COLOR','lightgoldenrodyellow'),('COLOR','lightgray'),('COLOR','lightgreen'),('COLOR','lightgrey'),('COLOR','lightpink'),('COLOR','lightsalmon'),('COLOR','lightseagreen'),('COLOR','lightskyblue'),('COLOR','lightslategray');
;

WITH cte(box_title) AS (
	SELECT 'Computer Languages' UNION ALL
	SELECT 'Products' UNION ALL
	SELECT 'Skills' UNION ALL
	SELECT 'Centers of interest'
)
INSERT INTO box(title)
SELECT box_title
FROM cte;

WITH cte(box_title, field_name, importance) AS (
	SELECT 'Computer Languages', 'C++', 35 UNION ALL
	SELECT 'Computer Languages', 'SQL', 35 UNION ALL
 	SELECT 'Computer Languages', 'JSON', 10 UNION ALL
  	SELECT 'Computer Languages', 'JS', 30 UNION ALL
	SELECT 'Computer Languages', 'Html', 10 UNION ALL
 	SELECT 'Computer Languages', 'Css', 10 UNION ALL
	SELECT 'Computer Languages', 'Python', 5 UNION ALL
	SELECT 'Products', 'SQL Server', 40 UNION ALL
	SELECT 'Products', 'PostgreSQL', 20 UNION ALL
	SELECT 'Products', 'Oracle', 10 UNION ALL
	SELECT 'Products', 'PGLite', 10 UNION ALL
	SELECT 'Products', 'NodeJS', 20 UNION ALL
	SELECT 'Products', 'Web Browsers', 30 UNION ALL
	SELECT 'Skills', 'Endurance', 20 UNION ALL
	SELECT 'Skills', 'Vision', 15 UNION ALL
	SELECT 'Skills', 'Persistence', 30 UNION ALL
	SELECT 'Skills', 'Research', 30 UNION ALL
	SELECT 'Skills', 'Curiosity', 35 UNION ALL
	SELECT 'Skills', 'Dependable', 25 UNION ALL
	SELECT 'Skills', 'Abstraction', 20 UNION ALL
	SELECT 'Skills', 'Practical', 15 UNION ALL
	SELECT 'Centers of interest', 'Queries', 30 UNION ALL
	SELECT 'Centers of interest', 'functional Programing', 30 UNION ALL
	SELECT 'Centers of interest', 'Mathematics', 30 UNION ALL
	SELECT 'Centers of interest', 'Information Structure', 30 UNION ALL
	SELECT 'Centers of interest', 'Multi Language', 30 UNION ALL
	SELECT 'Centers of interest', 'Long Challenging Projects', 30 UNION ALL
	SELECT 'Centers of interest', 'Regression Monitoring', 30 UNION ALL
	SELECT 'Centers of interest', 'Evolutivity', 30 UNION ALL
	SELECT 'Centers of interest', 'Robustness', 30
)
INSERT INTO field(idbox, name, importance)
SELECT b.idbox, cte.field_name, cte.importance
FROM cte
JOIN box b ON b.title=cte.box_title;
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
				SUM(importance) OVER(PARTITION BY idbox) AS total
			FROM field
		), cte2 AS (
			SELECT *, (2*${Radius}*3.14*importance/total)::numeric(10,2) AS dasharray,
				(2*${Radius}*3.14*coalesce(running_total)/total)::numeric(10,2) AS dashoffset,
				importance * 100 / total AS percentage
			FROM cte
		), cte3(idbox, "order", html) AS (
			SELECT idbox, 1, FORMAT('
				<svg id="svg%1s" height="${4*Radius}" width="${4*Radius}">', idbox)
			FROM box

			UNION ALL

			SELECT idbox, 2, STRING_AGG(FORMAT('
				<circle r="${Radius}" cx="${2*Radius}" cy="${2*Radius}"
        				stroke="%1s"
					stroke-width="${2*Radius}"
        				stroke-dasharray="%2s %3s"
        				stroke-dashoffset="%4s"/>',
				code, --%1
				dasharray, --%2
				(3.14*2*${Radius})::numeric(10,2), --%3
				-coalesce(dashoffset,0)), --%4
			 '' ORDER BY idfield)
			FROM cte2
			JOIN tag ON tag.type_code='COLOR' AND idtag=idfield
			GROUP BY idbox

			UNION ALL

			SELECT idbox, 3, STRING_AGG(FORMAT('
				<text x="%1s" y="%2s">%3s</text>',
				(2*${Radius} + 1.5*${Radius}*cos((COALESCE(running_total,0)+importance/2)*2*3.14/total))::numeric(10,2),
				(2*${Radius} + 1.5*${Radius}*sin((COALESCE(running_total,0)+importance/2)*2*3.14/total))::numeric(10,2),
				name),
			'' ORDER BY idfield)
			FROM cte2
			GROUP BY idbox

			UNION ALL

			SELECT idbox, 4, FORMAT('<text x="${2*Radius}" y="20">%1s</text>', title)
			FROM box

			UNION ALL

			SELECT idbox, 5, '</svg>'
			FROM box
		)
		SELECT STRING_AGG(html, '' ORDER BY idbox, "order") AS html
		FROM cte3
	`);

	console.log(ret.rows[0].html);

	document.body.innerHTML = ret.rows[0].html;
}
