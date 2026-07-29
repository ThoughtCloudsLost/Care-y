/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Categories_BodyInputs */

const en_demo_narrative_topic_library_categories_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrators organize the knowledge library into categories from this sheet. Categories are stored as org-key-encrypted records, so a database breach reveals no category names. The demo database starts with a small set of seeded categories.`)
};

const es_demo_narrative_topic_library_categories_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los administradores organizan la biblioteca de conocimiento en categorias desde esta ventana. Las categorias se almacenan como registros cifrados con la clave de la organizacion, por lo que una filtracion de la base de datos no revela los nombres de las categorias. La base de datos del demo comienza con un conjunto pequeno de categorias.`)
};

/**
* | output |
* | --- |
* | "Administrators organize the knowledge library into categories from this sheet. Categories are stored as org-key-encrypted records, so a database breach revea..." |
*
* @param {Demo_Narrative_Topic_Library_Categories_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_categories_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Categories_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Categories_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_categories_body(inputs)
	return es_demo_narrative_topic_library_categories_body(inputs)
});