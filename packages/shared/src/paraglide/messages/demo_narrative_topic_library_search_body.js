/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Search_BodyInputs */

const en_demo_narrative_topic_library_search_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The library has its own search bar that finds articles by fuzzy matching against decrypted titles and excerpts.
**Full search.** If no matches are found among the already decrypted articles, the search can fetch and decrypt all article body text to search the full content. A coverage indicator shows how many articles have been searched out of the total.
**Privacy.** No search terms are sent to the server. The server does not know what the volunteer searched for or which articles matched.`)
};

const es_demo_narrative_topic_library_search_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La biblioteca tiene su propia barra de búsqueda que encuentra artículos mediante comparación aproximada contra títulos y extractos descifrados.
**Búsqueda completa.** Si no se encuentran coincidencias entre los artículos ya descifrados, la búsqueda puede obtener y descifrar todo el texto de los artículos para buscar en el contenido completo. Un indicador de cobertura muestra cuántos artículos se han buscado del total.
**Privacidad.** Ningún término de búsqueda se envía al servidor. El servidor no sabe qué buscó el voluntario ni qué artículos coincidieron.`)
};

/**
* | output |
* | --- |
* | "The library has its own search bar that finds articles by fuzzy matching against decrypted titles and excerpts. **Full search.** If no matches are found amon..." |
*
* @param {Demo_Narrative_Topic_Library_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_search_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Search_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Search_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_search_body(inputs)
	return es_demo_narrative_topic_library_search_body(inputs)
});