

window.main = async function main()
{
	const card = document.getElementById("card");
	var container = document.getElementById("cards");

	for (var i = 0; i < 100; i++)
	{
		container.appendChild(card.cloneNode(true));
	}
}
