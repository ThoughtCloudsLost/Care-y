/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Vote_BodyInputs */

const en_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can rate whether a knowledge article helped resolve a call. Votes are recorded under a pseudonym instead of a volunteer name and persist in the visitor's own in-browser database. The aggregate score uses a Wilson confidence interval so articles with few votes do not outrank well-tested ones.`)
};

const es_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden calificar si un articulo del conocimiento ayudo a resolver una llamada. Los votos se registran bajo un seudonimo en lugar del nombre del voluntario y persisten en la base de datos del navegador del visitante. La puntuacion agregada usa un intervalo de confianza de Wilson para que articulos con pocos votos no superen a los bien evaluados.`)
};

/**
* | output |
* | --- |
* | "Volunteers can rate whether a knowledge article helped resolve a call. Votes are recorded under a pseudonym instead of a volunteer name and persist in the vi..." |
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