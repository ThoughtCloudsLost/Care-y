/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Library_Attachments_BodyInputs */

const en_demo_narrative_library_attachments_body = /** @type {(inputs: Demo_Narrative_Library_Attachments_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Articles can have file attachments, both inline images and downloadable files.
**Encryption.** All attachments are encrypted with the organization key before storage. The browser downloads and decrypts them locally.
**Allowed types.** JPEG, PNG, GIF, WebP, and PDF files are accepted.`)
};

const es_demo_narrative_library_attachments_body = /** @type {(inputs: Demo_Narrative_Library_Attachments_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los artículos pueden tener archivos adjuntos, tanto imágenes en línea como archivos descargables.
**Cifrado.** Todos los adjuntos se cifran con la clave de la organización antes de almacenarse. El navegador los descarga y descifra localmente.
**Tipos permitidos.** Se aceptan archivos JPEG, PNG, GIF, WebP y PDF.`)
};

/**
* | output |
* | --- |
* | "Articles can have file attachments, both inline images and downloadable files. **Encryption.** All attachments are encrypted with the organization key before..." |
*
* @param {Demo_Narrative_Library_Attachments_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_library_attachments_body = /** @type {((inputs?: Demo_Narrative_Library_Attachments_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Library_Attachments_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_library_attachments_body(inputs)
	return en_demo_narrative_library_attachments_body(inputs)
});