/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Vote_BodyInputs */

const en_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Any user with the View knowledge base permission can mark an article as helpful or unhelpful, change that mark, or remove it. Each user gets one vote per article. The browser updates the two tallies before the server confirms the write and restores the previous tallies if the server rejects it. [[#permissions #client-data]]
**What does a vote change in the ordering?** The server recalculates a ranking score after each vote. An article with two helpful votes and none against it scores lower than one with forty helpful votes and ten against it, because the score accounts for how many votes the article has attracted, not only the ratio between them. That score is what the rating sort and the two rating filter bands read. [List tools](#library/tools) covers those bands. [[#metadata]]
**What does a vote expose?** The article's title and body remain encrypted. [Browsing articles](#library/browse) covers what else the article row holds. [[#server-holds #metadata #privacy]]
**The vote service and its migrations.** \`createKBVoteService\` in \`packages/server/src/kb/service.ts\` writes the vote row and then updates the two tallies and the score on the article row. The score is the lower bound of a Wilson confidence interval over the two tallies; \`wilsonScore\` in the same file is the formula. The table is \`039_create_kb_votes.ts\` with a unique constraint on article and voter; deleting the article cascades into its votes. [[#server-holds]]`)
};

const es_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cualquier persona con el permiso Ver base de conocimiento puede marcar un artículo como útil o no útil, cambiar esa marca o retirarla. Cada persona tiene un voto por artículo. El navegador actualiza los dos conteos antes de que el servidor confirme la escritura y restaura los conteos anteriores si el servidor la rechaza. [[#permissions #client-data]]
**¿Qué cambia un voto en el orden?** El servidor recalcula una puntuación de clasificación tras cada voto. Un artículo con dos votos favorables y ninguno en contra puntúa por debajo de uno con cuarenta favorables y diez en contra, porque la puntuación tiene en cuenta cuántos votos ha recibido el artículo, no solo la proporción entre ellos. Esa puntuación es la que leen el orden por valoración y las dos bandas de filtro por valoración. [Herramientas de la lista](#library/tools) trata esas bandas. [[#metadata]]
**¿Qué expone un voto?** El título y el cuerpo del artículo permanecen cifrados. [Navegar artículos](#library/browse) trata qué más contiene la fila del artículo. [[#server-holds #metadata #privacy]]
**El servicio de votos y sus migraciones.** \`createKBVoteService\` en \`packages/server/src/kb/service.ts\` escribe la fila del voto y luego actualiza los dos conteos y la puntuación en la fila del artículo. La puntuación es el límite inferior de un intervalo de confianza de Wilson sobre los dos conteos; \`wilsonScore\` en el mismo archivo es la fórmula. La tabla es \`039_create_kb_votes.ts\` con una restricción de unicidad por artículo y votante; eliminar el artículo arrastra sus votos en cascada. [[#server-holds]]`)
};

const en_xa2_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àny ùsèr wìth thè Vìèw knòwlèdgè bàsè pèrmìssìòn càn màrk àn àrtìclè às hèlpfùl òr ùnhèlpfùl, chàngè thàt màrk, òr rèmòvè ìt. Èàch ùsèr gèts ònè vòtè pèr àrtìclè. Thè bròwsèr ùpdàtès thè twò tàllìès bèfòrè thè sèrvèr cònfìrms thè wrìtè ànd rèstòrès thè prèvìòùs tàllìès ìf thè sèrvèr rèjècts ìt. [[#pèrmìssìòns #clìènt-dàtà]]
 ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à vòtè chàngè ìn thè òrdèrìng? ••••••••••••** Thè sèrvèr rècàlcùlàtès à rànkìng scòrè àftèr èàch vòtè. Àn àrtìclè wìth twò hèlpfùl vòtès ànd nònè àgàìnst ìt scòrès lòwèr thàn ònè wìth fòrty hèlpfùl vòtès ànd tèn àgàìnst ìt, bècàùsè thè scòrè àccòùnts fòr hòw màny vòtès thè àrtìclè hàs àttràctèd, nòt ònly thè ràtìò bètwèèn thèm. Thàt scòrè ìs whàt thè ràtìng sòrt ànd thè twò ràtìng fìltèr bànds rèàd. [Lìst tòòls](#lìbràry/tòòls) còvèrs thòsè bànds. [[#mètàdàtà]]
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Whàt dòès à vòtè èxpòsè? ••••••••** Thè àrtìclè's tìtlè ànd bòdy rèmàìn èncryptèd. [Bròwsìng àrtìclès](#lìbràry/bròwsè) còvèrs whàt èlsè thè àrtìclè ròw hòlds. [[#sèrvèr-hòlds #mètàdàtà #prìvàcy]]
 •••••••••••••••••••••••••••••••••••••••••••••••••**Thè vòtè sèrvìcè ànd ìts mìgràtìòns. •••••••••••** \`crèàtèKBVòtèSèrvìcè\` ìn \`pàckàgès/sèrvèr/src/kb/sèrvìcè.ts\` wrìtès thè vòtè ròw ànd thèn ùpdàtès thè twò tàllìès ànd thè scòrè òn thè àrtìclè ròw. Thè scòrè ìs thè lòwèr bòùnd òf à Wìlsòn cònfìdèncè ìntèrvàl òvèr thè twò tàllìès; \`wìlsònScòrè\` ìn thè sàmè fìlè ìs thè fòrmùlà. Thè tàblè ìs \`039_crèàtè_kb_vòtès.ts\` wìth à ùnìqùè cònstràìnt òn àrtìclè ànd vòtèr; dèlètìng thè àrtìclè càscàdès ìntò ìts vòtès. [[#sèrvèr-hòlds]] •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Any user with the View knowledge base permission can mark an article as helpful or unhelpful, change that mark, or remove it. Each user gets one vote per art..." |
*
* @param {Demo_Narrative_Topic_Library_Vote_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_vote_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Vote_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Vote_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_library_vote_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_library_vote_body(inputs)
	return en_demo_narrative_topic_library_vote_body(inputs)
});