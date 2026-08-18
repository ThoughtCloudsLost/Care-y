/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Search_Entities_BodyInputs */

const en_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Search returns results from three entity types.
**Tickets.** Matches on decrypted title, client alias, queue name, and assignee name. Full search also matches on message content within tickets.
**Knowledge base articles.** Matches on decrypted title and excerpt. Full search also matches on full article body text.
**Volunteers.** Available to administrators and managers only. Matches on decrypted display names.`)
};

const es_demo_narrative_search_entities_body = /** @type {(inputs: Demo_Narrative_Search_Entities_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La busqueda devuelve resultados de tres tipos de entidad.
**Tickets.** Coincide con titulo descifrado, alias del cliente, nombre de la cola y nombre del asignado. La busqueda completa tambien coincide con el contenido de los mensajes dentro de los tickets.
**Articulos de la base de conocimiento.** Coincide con titulo y extracto descifrados. La busqueda completa tambien coincide con el texto completo del articulo.
**Voluntarios.** Disponible solo para administradores y gestores. Coincide con nombres visibles descifrados.`)
};

/**
* | output |
* | --- |
* | "Search returns results from three entity types. **Tickets.** Matches on decrypted title, client alias, queue name, and assignee name. Full search also matche..." |
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