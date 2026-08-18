/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Browse_BodyInputs */

const en_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The library lists all published articles grouped by category. Each article shows a decrypted title and excerpt. Tapping an article opens the full detail view with the complete body text, file attachments, and voting controls.
**Desktop split view.** On wider screens, the article list and detail view sit side by side, similar to the ticket list split view.`)
};

const es_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La biblioteca lista todos los articulos publicados agrupados por categoria. Cada articulo muestra un titulo y extracto descifrados. Tocar un articulo abre la vista detallada completa con el texto integro, adjuntos de archivos y controles de votacion.
**Vista dividida en escritorio.** En pantallas mas anchas, la lista de articulos y la vista detallada se colocan lado a lado, similar a la vista dividida de la lista de tickets.`)
};

/**
* | output |
* | --- |
* | "The library lists all published articles grouped by category. Each article shows a decrypted title and excerpt. Tapping an article opens the full detail view..." |
*
* @param {Demo_Narrative_Library_Browse_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_browse_body = /** @type {((inputs?: Demo_Narrative_Library_Browse_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Browse_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_library_browse_body(inputs)
	return es_demo_narrative_library_browse_body(inputs)
});