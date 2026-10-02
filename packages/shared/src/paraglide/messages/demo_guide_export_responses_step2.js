/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Export_Responses_Step2Inputs */

const en_demo_guide_export_responses_step2 = /** @type {(inputs: Demo_Guide_Export_Responses_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Open the response viewer.`)
};

const es_demo_guide_export_responses_step2 = /** @type {(inputs: Demo_Guide_Export_Responses_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Abre el visor de respuestas.`)
};

const en_xa2_demo_guide_export_responses_step2 = /** @type {(inputs: Demo_Guide_Export_Responses_Step2Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Òpèn thè rèspònsè vìèwèr. ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Open the response viewer." |
*
* @param {Demo_Guide_Export_Responses_Step2Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_export_responses_step2 = /** @type {((inputs?: Demo_Guide_Export_Responses_Step2Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Export_Responses_Step2Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_export_responses_step2(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_export_responses_step2(inputs)
	return en_demo_guide_export_responses_step2(inputs)
});