/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Verify_Server_Blindness_Step4Inputs */

const en_demo_guide_verify_server_blindness_step4 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the Keys page. It reports whether the organization key is present and offers escrow export.`)
};

const es_demo_guide_verify_server_blindness_step4 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre la página Claves. Informa si la clave de organización está presente y ofrece la exportación de custodia.`)
};

const en_xa2_demo_guide_verify_server_blindness_step4 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè Kèys pàgè. Ìt rèpòrts whèthèr thè òrgànìzàtìòn kèy ìs prèsènt ànd òffèrs èscròw èxpòrt. •••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the Keys page. It reports whether the organization key is present and offers escrow export." |
*
* @param {Demo_Guide_Verify_Server_Blindness_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_verify_server_blindness_step4 = /** @type {((inputs?: Demo_Guide_Verify_Server_Blindness_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Verify_Server_Blindness_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_verify_server_blindness_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_verify_server_blindness_step4(inputs)
	return en_demo_guide_verify_server_blindness_step4(inputs)
});