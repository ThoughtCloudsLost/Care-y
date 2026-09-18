/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Decryption_BodyInputs */

const en_demo_narrative_topic_decryption_body = /** @type {(inputs: Demo_Narrative_Topic_Decryption_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ticket titles are stored as ciphertext on the server. The browser fetches and decrypts each title locally using the volunteer's encryption keys.
**Performance.** Tickets that have already been decrypted during the current session are cached in the browser's memory, so revisiting the list shows them instantly without re-decrypting.`)
};

const es_demo_narrative_topic_decryption_body = /** @type {(inputs: Demo_Narrative_Topic_Decryption_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Los títulos de los tickets se almacenan como texto cifrado en el servidor. El navegador obtiene y descifra cada título localmente usando las claves de cifrado del voluntario.
**Rendimiento.** Los tickets que ya han sido descifrados durante la sesión actual se almacenan en la memoria del navegador, por lo que revisitar la lista los muestra instantáneamente sin volver a descifrar.`)
};

/**
* | output |
* | --- |
* | "Ticket titles are stored as ciphertext on the server. The browser fetches and decrypts each title locally using the volunteer's encryption keys. **Performanc..." |
*
* @param {Demo_Narrative_Topic_Decryption_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_decryption_body = /** @type {((inputs?: Demo_Narrative_Topic_Decryption_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Decryption_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_topic_decryption_body(inputs)
	return en_demo_narrative_topic_decryption_body(inputs)
});