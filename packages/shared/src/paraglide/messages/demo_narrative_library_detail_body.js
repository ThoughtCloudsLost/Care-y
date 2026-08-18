/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Detail_BodyInputs */

const en_demo_narrative_library_detail_body = /** @type {(inputs: Demo_Narrative_Library_Detail_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The full article view shows the complete body text, file attachments, and voting controls. The body is decrypted locally from ciphertext stored on the server.
**Metadata.** The detail view shows the article title, category, author, creation date, and last updated date. The author's display name is decrypted from the organization key.`)
};

const es_demo_narrative_library_detail_body = /** @type {(inputs: Demo_Narrative_Library_Detail_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La vista completa del articulo muestra el texto integro, adjuntos de archivos y controles de votacion. El cuerpo se descifra localmente a partir del texto cifrado almacenado en el servidor.
**Metadatos.** La vista detallada muestra el titulo del articulo, la categoria, el autor, la fecha de creacion y la fecha de ultima actualizacion. El nombre visible del autor se descifra a partir de la clave de la organizacion.`)
};

/**
* | output |
* | --- |
* | "The full article view shows the complete body text, file attachments, and voting controls. The body is decrypted locally from ciphertext stored on the server..." |
*
* @param {Demo_Narrative_Library_Detail_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_detail_body = /** @type {((inputs?: Demo_Narrative_Library_Detail_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Detail_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_library_detail_body(inputs)
	return es_demo_narrative_library_detail_body(inputs)
});