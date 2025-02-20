import { PGlite } from "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js";

const db = new PGlite();

window.main = async function main()
{
	const rt = db.exec(`
		CREATE TABLE language(
			idlanguage SERIAL PRIMARY KEY,
			name varchar(128),
			years integer,
			importance integer
		);

		INSERT INTO language(name, years, importance) VALUES
			('C++', 10, 35),
			('SQL', 10, 35),
			('NodeJS', 3, 10),
			('JS', 5, 20),
			('Python', 2, 5);
	`);

	const ret = db.query(`
		WITH cte AS (
			SELECT SUM(importance) AS total
			FROM language
		), cte2 AS (
			SELECT *, importance * 100 / total AS percentage
			FROM language
			CROSS JOIN cte
		), cte3 AS (
			SELECT *, 10*3.14*percentage/100 AS dasharray
			FROM cte2
		), cte4 AS (
			SELECT *, SUM(dasharray) OVER(ORDER BY idlanguage
				ROWS BETWEEN UNBOUNDED PRECEDING AND CURRENT ROW) AS running_total
			FROM cte3
          	)
		SELECT STRING_AGG(FORMAT('
<circle r="5" cx="10" cy="10" fill="transparent"
        stroke="dodgerblue"
        stroke-width="10"
        stroke-dasharray="%1$ 31.4"
        stroke-dashoffset="%2$"/>',
			dasharray, --%1
			-running_total), '' ORDER BY idlanguage), --%2
		FROM cte4
	`);

	console.log(ret.rows[0].string_agg);
}
