/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Verify_Server_Blindness_Step2Inputs */

const en_demo_guide_verify_server_blindness_step2 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Send a reply and note which fields appear in the thread.`)
};

const es_demo_guide_verify_server_blindness_step2 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Envía una respuesta y observa qué campos aparecen en el hilo.`)
};

const en_xa2_demo_guide_verify_server_blindness_step2 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sènd à rèply ànd nòtè whìch fìèlds àppèàr ìn thè thrèàd. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Send a reply and note which fields appear in the thread." |
*
* @param {Demo_Guide_Verify_Server_Blindness_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_verify_server_blindness_step2 = /** @type {((inputs?: Demo_Guide_Verify_Server_Blindness_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Verify_Server_Blindness_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_verify_server_blindness_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_verify_server_blindness_step2(inputs)
	return en_demo_guide_verify_server_blindness_step2(inputs)
});