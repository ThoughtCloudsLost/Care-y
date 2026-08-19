/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Categories_BodyInputs */

const en_demo_narrative_topic_library_categories_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Administrators organize the knowledge library into categories. Each category name is encrypted with the organization key before storage, so a database breach reveals no category names.
**Permissions.** Only administrators can create, rename, or delete categories, while all volunteers can browse articles within any category.`)
};

const es_demo_narrative_topic_library_categories_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Categories_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los administradores organizan la biblioteca de conocimiento en categorias. Cada nombre de categoria se cifra con la clave de la organizacion antes de almacenarse, por lo que una filtracion de la base de datos no revela los nombres de las categorias.
**Permisos.** Solo los administradores pueden crear, renombrar o eliminar categorias, mientras que todos los voluntarios pueden navegar los articulos dentro de cualquier categoria.`)
};

/**
* | output |
* | --- |
* | "Administrators organize the knowledge library into categories. Each category name is encrypted with the organization key before storage, so a database breach..." |
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