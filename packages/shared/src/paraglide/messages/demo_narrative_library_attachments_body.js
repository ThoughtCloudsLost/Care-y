/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Attachments_BodyInputs */

const en_demo_narrative_library_attachments_body = /** @type {(inputs: Demo_Narrative_Library_Attachments_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Articles can have file attachments. Images inserted inline in the article body appear within the text. Other file types appear as download chips below the article.
**Encryption.** All attachments are encrypted with the organization key before storage. The server stores encrypted binary data. Volunteers download and decrypt attachments in the browser.
**Allowed types.** JPEG, PNG, GIF, WebP, and PDF files are accepted.`)
};

const es_demo_narrative_library_attachments_body = /** @type {(inputs: Demo_Narrative_Library_Attachments_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los artículos pueden tener archivos adjuntos. Las imágenes insertadas en el cuerpo del artículo aparecen dentro del texto. Otros tipos de archivo aparecen como fichas de descarga debajo del artículo.
**Cifrado.** Todos los adjuntos se cifran con la clave de la organización antes de almacenarse. El servidor almacena datos binarios cifrados. Los voluntarios descargan y descifran los adjuntos en el navegador.
**Tipos permitidos.** Se aceptan archivos JPEG, PNG, GIF, WebP y PDF.`)
};

/**
* | output |
* | --- |
* | "Articles can have file attachments. Images inserted inline in the article body appear within the text. Other file types appear as download chips below the ar..." |
*
* @param {Demo_Narrative_Library_Attachments_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_attachments_body = /** @type {((inputs?: Demo_Narrative_Library_Attachments_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Attachments_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_library_attachments_body(inputs)
	return es_demo_narrative_library_attachments_body(inputs)
});