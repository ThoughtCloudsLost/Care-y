/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Verify_Server_Blindness_Step1Inputs */

const en_demo_guide_verify_server_blindness_step1 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open a ticket and read the conversation thread.`)
};

const es_demo_guide_verify_server_blindness_step1 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre un ticket y lee el hilo de conversación.`)
};

const en_xa2_demo_guide_verify_server_blindness_step1 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step1Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn à tìckèt ànd rèàd thè cònvèrsàtìòn thrèàd. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open a ticket and read the conversation thread." |
*
* @param {Demo_Guide_Verify_Server_Blindness_Step1Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_verify_server_blindness_step1 = /** @type {((inputs?: Demo_Guide_Verify_Server_Blindness_Step1Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Verify_Server_Blindness_Step1Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_verify_server_blindness_step1(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_verify_server_blindness_step1(inputs)
	return en_demo_guide_verify_server_blindness_step1(inputs)
});