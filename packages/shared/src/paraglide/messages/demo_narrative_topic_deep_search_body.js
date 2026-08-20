/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Deep_Search_BodyInputs */

const en_demo_narrative_topic_deep_search_body = /** @type {(inputs: Demo_Narrative_Topic_Deep_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can search within a single ticket's conversation for specific words or phrases. The search runs entirely in the browser against the decrypted message content.
**Deep search.** If the search term produces no matches among the currently loaded messages, the system automatically loads and decrypts older pages of the conversation and searches those as well. A progress indicator shows how many messages have been searched out of the total. The search term must be at least two characters.
**Privacy.** No search terms are sent to the server. The server does not know what the volunteer searched for or which messages matched.`)
};

const es_demo_narrative_topic_deep_search_body = /** @type {(inputs: Demo_Narrative_Topic_Deep_Search_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden buscar dentro de la conversación de un ticket palabras o frases específicas. La búsqueda se ejecuta completamente en el navegador contra el contenido descifrado de los mensajes.
**Búsqueda profunda.** Si el término de búsqueda no produce resultados entre los mensajes actualmente cargados, el sistema carga y descifra automáticamente páginas más antiguas de la conversación y busca en ellas también. Un indicador de progreso muestra cuántos mensajes se han buscado del total. El término de búsqueda debe tener al menos dos caracteres.
**Privacidad.** Ningún término de búsqueda se envía al servidor. El servidor no sabe qué buscó el voluntario ni qué mensajes coincidieron.`)
};

/**
* | output |
* | --- |
* | "Volunteers can search within a single ticket's conversation for specific words or phrases. The search runs entirely in the browser against the decrypted mess..." |
*
* @param {Demo_Narrative_Topic_Deep_Search_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_deep_search_body = /** @type {((inputs?: Demo_Narrative_Topic_Deep_Search_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Deep_Search_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_deep_search_body(inputs)
	return es_demo_narrative_topic_deep_search_body(inputs)
});