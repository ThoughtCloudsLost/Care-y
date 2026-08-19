/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Tickets_Body2Inputs */

const en_demo_narrative_tickets_body2 = /** @type {(inputs: Demo_Narrative_Tickets_Body2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When you open the app, your browser decrypts each ticket on the fly. If your session ends, the keys are wiped from memory and the data returns to scrambled ciphertext.`)
};

const es_demo_narrative_tickets_body2 = /** @type {(inputs: Demo_Narrative_Tickets_Body2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando abres la aplicación, tu navegador descifra cada ticket sobre la marcha. Si tu sesión termina, las claves se borran de la memoria y los datos vuelven a ser texto cifrado.`)
};

/**
* | output |
* | --- |
* | "When you open the app, your browser decrypts each ticket on the fly. If your session ends, the keys are wiped from memory and the data returns to scrambled c..." |
*
* @param {Demo_Narrative_Tickets_Body2Inputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_tickets_body2 = /** @type {((inputs?: Demo_Narrative_Tickets_Body2Inputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Tickets_Body2Inputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_narrative_tickets_body2(inputs)
	return es_demo_narrative_tickets_body2(inputs)
});