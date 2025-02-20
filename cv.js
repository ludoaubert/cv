import { PGlite } from "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js";

const db = new PGlite();

window.main = async function main()
{
	const rt = await db.exec(`
		CREATE TABLE language(
			idlanguage SERIAL PRIMARY KEY,
			name varchar(128),
			years integer,
			importance integer,
			color varchar(128),
			UNIQUE(name)
		);

		INSERT INTO language(name, years, importance, color) VALUES
			('C++', 10, 35, 'dodgerblue'),
			('SQL', 10, 35, 'gold'),
			('NodeJS', 3, 10, 'yellowgreen'),
			('JS', 5, 20, 'tomato'),
			('Python', 2, 5, 'orange');
	`);

	const ret = await db.query(`
		WITH cte AS (
			SELECT SUM(importance) AS total
			FROM language
		), cte2 AS (
			SELECT *, importance * 100 / total AS percentage
			FROM language
			CROSS JOIN cte
		), cte3 AS (
			SELECT *, SUM(percentage) OVER(ORDER BY idlanguage
				ROWS BETWEEN UNBOUNDED PRECEDING AND 1 PRECEDING) AS running_total
			FROM cte2
		), cte4 AS (
			SELECT *, (10*3.14*percentage/100)::numeric(10,2) AS dasharray,
				(10*3.14*coalesce(running_total,0)/100)::numeric(10,2) AS dashoffset
			FROM cte3
		), cte5(html) AS (
			SELECT STRING_AGG(FORMAT('
				<circle r="5" cx="10" cy="10" fill="transparent"
        				stroke="%2s"
        				stroke-width="10"
        				stroke-dasharray="%3s %4s"
        				stroke-dashoffset="%5s"/>',
				color, --%2
				dasharray, --%3
				(3.14*2*5)::numeric(10,2), --%4
				-coalesce(dashoffset,0)), --%5
			 '' ORDER BY idlanguage)
			FROM cte4

			UNION ALL

			SELECT STRING_AGG(FORMAT('
				<text x="%1s" y="%2s" font-size="1px" fill="black" >%3s</text>',
				10 + 5*cos((running_total+percentage/2)*2*3.14/100),
				10 + 5*sin((running_total+percentage/2)*2*3.14/100),
				name),
			'' ORDER BY idlanguage)
			FROM cte4
		)
		SELECT STRING_AGG(html, '') AS html
		FROM cte5
	`);

	console.log(ret.rows[0].html);

	document.getElementById("svg2").innerHTML = ret.rows[0].html;
}
