/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Vote_BodyInputs */

const en_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can rate whether a knowledge base article helped resolve a call. Each volunteer gets one vote per article (up or down).
**Ranking.** The aggregate score uses a Wilson confidence interval so that articles with only a few votes do not outrank articles that have been tested by many volunteers. An article with two votes and no downvotes does not automatically appear above an article with fifty votes and a few downvotes.`)
};

const es_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden calificar si un artículo de la base de conocimiento ayudó a resolver una llamada. Cada voluntario tiene un voto por artículo (a favor o en contra).
**Clasificación.** La puntuación agregada usa un intervalo de confianza de Wilson para que los artículos con solo unos pocos votos no superen a los que han sido evaluados por muchos voluntarios. Un artículo con dos votos y ningún voto en contra no aparece automáticamente por encima de un artículo con cincuenta votos y algunos en contra.`)
};

/**
* | output |
* | --- |
* | "Volunteers can rate whether a knowledge base article helped resolve a call. Each volunteer gets one vote per article (up or down). **Ranking.** The aggregate..." |
*
* @param {Demo_Narrative_Topic_Library_Vote_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_vote_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Vote_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Vote_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_vote_body(inputs)
	return es_demo_narrative_topic_library_vote_body(inputs)
});