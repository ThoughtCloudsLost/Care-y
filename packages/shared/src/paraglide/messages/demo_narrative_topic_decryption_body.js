/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Topic_Decryption_BodyInputs */

const en_demo_narrative_topic_decryption_body = /** @type {(inputs: Demo_Narrative_Topic_Decryption_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When the ticket list loads, titles appear as scrambled text that resolves into readable words as the browser decrypts each one. This is the decryption process made visible.
**How it works.** The browser fetches the encrypted ticket data from the server, then uses the volunteer's encryption keys to decrypt each title locally. The descrambling animation shows this process in real time.
**Performance.** Tickets that have already been decrypted during the current session are cached in the browser's memory. Revisiting the list shows them instantly without re-decrypting.`)
};

const es_demo_narrative_topic_decryption_body = /** @type {(inputs: Demo_Narrative_Topic_Decryption_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando la lista de tickets se carga, los titulos aparecen como texto desordenado que se resuelve en palabras legibles a medida que el navegador descifra cada uno. Este es el proceso de descifrado hecho visible.
**Como funciona.** El navegador obtiene los datos cifrados del ticket del servidor, luego usa las claves de cifrado del voluntario para descifrar cada titulo localmente. La animacion de descifrado muestra este proceso en tiempo real.
**Rendimiento.** Los tickets que ya han sido descifrados durante la sesion actual se almacenan en la memoria del navegador. Revisitar la lista los muestra instantaneamente sin re-descifrar.`)
};

/**
* | output |
* | --- |
* | "When the ticket list loads, titles appear as scrambled text that resolves into readable words as the browser decrypts each one. This is the decryption proces..." |
*
* @param {Demo_Narrative_Topic_Decryption_BodyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_topic_decryption_body = /** @type {((inputs?: Demo_Narrative_Topic_Decryption_BodyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Topic_Decryption_BodyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_topic_decryption_body(inputs)
	return es_demo_narrative_topic_decryption_body(inputs)
});