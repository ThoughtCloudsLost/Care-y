/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Vote_BodyInputs */

const en_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`An account can mark one article as helpful or unhelpful once, change that mark, or take it away, and doing so takes no more permission than reading the article. The two tallies move as soon as the vote lands, and the browser shows the new tally before the server confirms it, putting the old one back if the write fails. [[#permissions #client-data]]
**What a vote is worth in the ordering.** A score is recalculated on every vote as the lower bound of a confidence interval over the two tallies, so an article with two votes and nothing against it does not outrank one tested by fifty. That score is what the rating sort and the rating filters read. [List tools](#library/tools) covers those filters. [[#metadata]]
**What a vote costs in privacy.** The vote row names the account, the article and the direction in plaintext, with one row per account per article. A database dump therefore shows who found which article useful, which is a map of what each person works on, and nothing about the article itself, whose title and body stay encrypted. [Browsing articles](#library/browse) covers what else that row holds. [[#server-holds #metadata #privacy]]
**The vote service and its columns.** \`createKBVoteService\` in \`packages/server/src/kb/service.ts\` writes the row and rewrites the two tallies and the score in one pass, and \`wilsonScore\` in the same file is the formula. The row is \`039_create_kb_votes.ts\`, unique on article and voter, cascading when the article goes; \`093_rename_kb_voter_column.ts\` renamed the voter column, which had implied a derived pseudonym that was never built. [[#server-holds]]`)
};

const es_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Una cuenta puede marcar un artículo como útil o poco útil una sola vez, cambiar esa marca o retirarla, y hacerlo no exige más permiso que leer el artículo. Los dos recuentos se mueven en cuanto el voto aterriza, y el navegador muestra el nuevo recuento antes de que el servidor lo confirme y repone el anterior si la escritura falla. [[#permissions #client-data]]
**Cuánto vale un voto en el orden.** En cada voto se recalcula una puntuación como el límite inferior de un intervalo de confianza sobre los dos recuentos, de modo que un artículo con dos votos y nada en contra no supera a uno probado por cincuenta. Esa puntuación es la que leen el orden por valoración y los filtros de valoración. [Herramientas de la lista](#library/tools) trata esos filtros. [[#metadata]]
**Cuánto cuesta un voto en privacidad.** La fila del voto nombra en texto plano la cuenta, el artículo y el sentido, con una fila por cuenta y artículo. Un volcado de la base de datos muestra por tanto quién encontró útil cada artículo, que es un mapa de en qué trabaja cada persona, y nada sobre el artículo en sí, cuyo título y cuerpo siguen cifrados. [Navegar artículos](#library/browse) trata qué más guarda esa fila. [[#server-holds #metadata #privacy]]
**El servicio de votos y sus columnas.** \`createKBVoteService\`, en \`packages/server/src/kb/service.ts\`, escribe la fila y reescribe los dos recuentos y la puntuación en una sola pasada, y \`wilsonScore\`, en ese mismo archivo, es la fórmula. La fila es \`039_create_kb_votes.ts\`, única por artículo y votante, y en cascada cuando se elimina el artículo; \`093_rename_kb_voter_column.ts\` renombró la columna del votante, que daba a entender un seudónimo derivado que nunca se construyó. [[#server-holds]]`)
};

const en_xa2_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèrs càn ràtè whèthèr à knòwlèdgè bàsè àrtìclè hèlpèd rèsòlvè à càll. Èàch vòlùntèèr gèts ònè vòtè pèr àrtìclè (ùp òr dòwn).
 ••••••••••••••••••••••••••••••••••••••••**Rànkìng. •••** Thè àggrègàtè scòrè ùsès à Wìlsòn cònfìdèncè ìntèrvàl sò thàt àrtìclès wìth ònly à fèw vòtès dò nòt òùtrànk àrtìclès thàt hàvè bèèn tèstèd by màny vòlùntèèrs. Àn àrtìclè wìth twò vòtès ànd nò dòwnvòtès dòès nòt àùtòmàtìcàlly àppèàr àbòvè àn àrtìclè wìth fìfty vòtès ànd à fèw dòwnvòtès. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "An account can mark one article as helpful or unhelpful once, change that mark, or take it away, and doing so takes no more permission than reading the artic..." |
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