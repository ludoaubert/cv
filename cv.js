import { PGlite } from "https://cdn.jsdelivr.net/npm/@electric-sql/pglite/dist/index.js";

const db = new PGlite();

window.main = async function main()
{
	const ret = db.exec(`
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
			SELECT idlanguage, name, importance * 100 / total AS percentage
			FROM language
			CROSS JOIN cte
			FROM language
		)
		SELECT id, name, percentage, 10*3.14*percentage/100 AS dasharray
		FROM cte2
	`);
}
