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
			color varchar(128)
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
			SELECT SUM(importance) AS total, 5 AS radius
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
			SELECT *, 10*3.14*percentage/100 AS dasharray,
				10*3.14*running_total/100 AS dashoffsert
			FROM cte3
		), cte5(html) AS (
			SELECT STRING_AGG(FORMAT('
				<circle r="%1s" cx="10" cy="10" fill="transparent"
        				stroke="%2s"
        				stroke-width="10"
        				stroke-dasharray="%3s %4s"
        				stroke-dashoffset="%5s"/>',
				radius, --%1
				color, --%2
				dasharray::NUMERIC(10, 2), --%3
				3.14*2*radius, --%4
				-coalesce(running_total,0)::NUMERIC(10, 2)) --%5
			 '' ORDER BY idlanguage)
			FROM cte4

			UNION ALL

			SELECT STRING_AGG(FORMAT('
				<text x="%1s" y="%2s" font-size="3px" fill="black" >%3s%%</text>',
				4*radius*cos((running_total+percentage/2)*2*3.14/100),
				4*radius*sin((running_total+percentage/2)*2*3.14/100),
				percentage::NUMERIC(10,0))
			'' ORDER BY idlanguage)
			FROM cte4
		)
		SELECT STRING_AGG(html, '') AS html
		FROM cte5
	`);

	console.log(ret.rows[0].string_agg);

	document.getElementById("svg2").innerHTML = ret.rows[0].string_agg;
}
