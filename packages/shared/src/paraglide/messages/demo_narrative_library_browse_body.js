/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Browse_BodyInputs */

const en_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The library lists all published articles grouped by category. Each article shows a decrypted title and excerpt. Both are stored as ciphertext on the server and decrypted locally with the organization key.
**Desktop split view.** On wider screens, the article list and detail view sit side by side, similar to the ticket list split view.`)
};

const es_demo_narrative_library_browse_body = /** @type {(inputs: Demo_Narrative_Library_Browse_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La biblioteca lista todos los artículos publicados agrupados por categoría. Cada artículo muestra un título y extracto descifrados. Ambos se almacenan como texto cifrado en el servidor y se descifran localmente con la clave de la organización.
**Vista dividida en escritorio.** En pantallas más anchas, la lista de artículos y la vista detallada se colocan lado a lado, similar a la vista dividida de la lista de tickets.`)
};

/**
* | output |
* | --- |
* | "The library lists all published articles grouped by category. Each article shows a decrypted title and excerpt. Both are stored as ciphertext on the server a..." |
*
* @param {Demo_Narrative_Library_Browse_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_browse_body = /** @type {((inputs?: Demo_Narrative_Library_Browse_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Browse_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_library_browse_body(inputs)
	return en_demo_narrative_library_browse_body(inputs)
});