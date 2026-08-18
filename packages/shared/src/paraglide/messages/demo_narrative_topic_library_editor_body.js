/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Library_Editor_BodyInputs */

const en_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The rich text editor supports headings (four levels), bold, italic, strikethrough, inline code, blockquotes, bullet lists, ordered lists, code blocks, links, tables, horizontal rules, and figures with captions.
**Images and attachments.** Images can be inserted inline in the article body. Other file types such as PDFs can be attached to an article and appear as download chips. All attachments are encrypted with the organization key before storage.
**Accessibility.** The editor checks heading hierarchy, warns about generic link text, and prompts for image alt text before inserting an image. A checkbox marks decorative images that do not need alt text.
**Encryption.** The full article body is encrypted with the organization key in the browser before being sent to the server. The server stores ciphertext it cannot read.`)
};

const es_demo_narrative_topic_library_editor_body = /** @type {(inputs: Demo_Narrative_Topic_Library_Editor_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El editor de texto enriquecido admite encabezados (cuatro niveles), negrita, cursiva, tachado, codigo en linea, citas, listas con vinetas, listas ordenadas, bloques de codigo, enlaces, tablas, lineas horizontales y figuras con pies de foto.
**Imagenes y adjuntos.** Las imagenes se pueden insertar directamente en el cuerpo del articulo. Otros tipos de archivo como PDFs se pueden adjuntar al articulo y aparecen como fichas de descarga. Todos los adjuntos se cifran con la clave de la organizacion antes de almacenarse.
**Accesibilidad.** El editor verifica la jerarquia de encabezados, advierte sobre texto de enlace generico y solicita texto alternativo para las imagenes antes de insertarlas. Una casilla marca las imagenes decorativas que no necesitan texto alternativo.
**Cifrado.** El cuerpo completo del articulo se cifra con la clave de la organizacion en el navegador antes de enviarse al servidor. El servidor almacena texto cifrado que no puede leer.`)
};

/**
* | output |
* | --- |
* | "The rich text editor supports headings (four levels), bold, italic, strikethrough, inline code, blockquotes, bullet lists, ordered lists, code blocks, links,..." |
*
* @param {Demo_Narrative_Topic_Library_Editor_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_library_editor_body = /** @type {((inputs?: Demo_Narrative_Topic_Library_Editor_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Library_Editor_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_library_editor_body(inputs)
	return es_demo_narrative_topic_library_editor_body(inputs)
});