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

const en_xa2_demo_narrative_topic_library_vote_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Vote_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèrs càn ràtè whèthèr à knòwlèdgè bàsè àrtìclè hèlpèd rèsòlvè à càll. Èàch vòlùntèèr gèts ònè vòtè pèr àrtìclè (ùp òr dòwn).
 ••••••••••••••••••••••••••••••••••••••••**Rànkìng. •••** Thè àggrègàtè scòrè ùsès à Wìlsòn cònfìdèncè ìntèrvàl sò thàt àrtìclès wìth ònly à fèw vòtès dò nòt òùtrànk àrtìclès thàt hàvè bèèn tèstèd by màny vòlùntèèrs. Àn àrtìclè wìth twò vòtès ànd nò dòwnvòtès dòès nòt àùtòmàtìcàlly àppèàr àbòvè àn àrtìclè wìth fìfty vòtès ànd à fèw dòwnvòtès. •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Volunteers can rate whether a knowledge base article helped resolve a call. Each volunteer gets one vote per article (up or down). **Ranking.** The aggregate..." |
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