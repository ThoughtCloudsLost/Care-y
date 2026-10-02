/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Export_Responses_Step3Inputs */

const en_demo_guide_export_responses_step3 = /** @type {(inputs: Demo_Guide_Export_Responses_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Look for any row showing Key not held.`)
};

const es_demo_guide_export_responses_step3 = /** @type {(inputs: Demo_Guide_Export_Responses_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Busca filas que muestren Clave no disponible.`)
};

const en_xa2_demo_guide_export_responses_step3 = /** @type {(inputs: Demo_Guide_Export_Responses_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòòk fòr àny ròw shòwìng Kèy nòt hèld. ••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Look for any row showing Key not held." |
*
* @param {Demo_Guide_Export_Responses_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_export_responses_step3 = /** @type {((inputs?: Demo_Guide_Export_Responses_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Export_Responses_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_export_responses_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_export_responses_step3(inputs)
	return en_demo_guide_export_responses_step3(inputs)
});