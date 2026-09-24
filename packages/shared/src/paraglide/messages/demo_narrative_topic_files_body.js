/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Files_BodyInputs */

const en_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteers can attach files to a ticket, and each file is encrypted with the per ticket key before upload so the server stores only ciphertext along with the encrypted filename. Downloading a file decrypts it on the device, which means the server delivers only ciphertext and never sees the file contents.`)
};

const es_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los voluntarios pueden adjuntar archivos a un ticket, y cada archivo se cifra con la clave por ticket antes de subirlo para que el servidor almacene solo texto cifrado junto con el nombre de archivo cifrado. Descargar un archivo lo descifra en el dispositivo, lo que significa que el servidor entrega solo texto cifrado y nunca ve el contenido del archivo.`)
};

const en_xa2_demo_narrative_topic_files_body = /** @type {(inputs: Demo_Narrative_Topic_Files_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèrs càn àttàch fìlès tò à tìckèt, ànd èàch fìlè ìs èncryptèd wìth thè pèr tìckèt kèy bèfòrè ùplòàd sò thè sèrvèr stòrès ònly cìphèrtèxt àlòng wìth thè èncryptèd fìlènàmè. Dòwnlòàdìng à fìlè dècrypts ìt òn thè dèvìcè, whìch mèàns thè sèrvèr dèlìvèrs ònly cìphèrtèxt ànd nèvèr sèès thè fìlè còntènts. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Volunteers can attach files to a ticket, and each file is encrypted with the per ticket key before upload so the server stores only ciphertext along with the..." |
*
* @param {Demo_Narrative_Topic_Files_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_files_body = /** @type {((inputs?: Demo_Narrative_Topic_Files_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Files_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_files_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_topic_files_body(inputs)
	return en_demo_narrative_topic_files_body(inputs)
});