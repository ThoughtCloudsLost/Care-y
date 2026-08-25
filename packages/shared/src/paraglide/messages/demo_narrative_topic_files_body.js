/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Files_BodyInputs */

const en_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can attach files to a ticket, and each file is encrypted with the per ticket key before upload so the server stores only ciphertext along with the encrypted filename. Downloading a file decrypts it on the device, which means the server never sees the file contents and the plaintext never travels over the network after the initial encryption.`)
};

const es_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden adjuntar archivos a un ticket, y cada archivo se cifra con la clave por ticket antes de subirlo para que el servidor almacene solo texto cifrado junto con el nombre de archivo cifrado. Descargar un archivo lo descifra en el dispositivo, lo que significa que el servidor nunca ve el contenido del archivo y el texto plano nunca viaja por la red después del cifrado inicial.`)
};

/**
* | output |
* | --- |
* | "Volunteers can attach files to a ticket, and each file is encrypted with the per ticket key before upload so the server stores only ciphertext along with the..." |
*
* @param {Demo_Narrative_Topic_Files_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_files_body = /** @type {((inputs?: Demo_Narrative_Topic_Files_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Files_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_files_body(inputs)
	return es_demo_narrative_topic_files_body(inputs)
});