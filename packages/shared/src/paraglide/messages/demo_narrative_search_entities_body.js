/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Entities_BodyInputs */

const en_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Global Search returns results from many different places in CARE-Y.
**Tickets.** Matches on decrypted title, client alias, queue name, and assignee name. Full deep search also matches on message content within tickets.
**Knowledge base articles.** Matches on decrypted title and excerpt. Full deep search also matches on full article body text.
**Volunteers.** Available to administrators and managers only. Matches on decrypted display names.`)
};

const es_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La búsqueda global devuelve resultados de muchos lugares diferentes en CARE-Y.
**Tickets.** Coincide con título descifrado, alias del cliente, nombre de la cola y nombre del asignado. La búsqueda profunda completa también coincide con el contenido de los mensajes dentro de los tickets.
**Artículos de la base de conocimiento.** Coincide con título y extracto descifrados. La búsqueda profunda completa también coincide con el texto completo del artículo.
**Voluntarios.** Disponible solo para administradores y gestores. Coincide con nombres visibles descifrados.`)
};

/**
* | output |
* | --- |
* | "Global Search returns results from many different places in CARE-Y. **Tickets.** Matches on decrypted title, client alias, queue name, and assignee name. Ful..." |
*
* @param {Demo_Narrative_Search_Entities_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_search_entities_body = /** @type {((inputs?: Demo_Narrative_Search_Entities_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Search_Entities_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_search_entities_body(inputs)
	return es_demo_narrative_search_entities_body(inputs)
});