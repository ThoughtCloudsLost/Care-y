/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Export_Responses_Step4Inputs */

const en_demo_guide_export_responses_step4 = /** @type {(inputs: Demo_Guide_Export_Responses_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tap Export CSV. A confirmation dialog reports how many responses will be included.`)
};

const es_demo_guide_export_responses_step4 = /** @type {(inputs: Demo_Guide_Export_Responses_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toca Exportar CSV. Un diálogo de confirmación indica cuántas respuestas se incluirán.`)
};

const en_xa2_demo_guide_export_responses_step4 = /** @type {(inputs: Demo_Guide_Export_Responses_Step4Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tàp Èxpòrt CSV. À cònfìrmàtìòn dìàlòg rèpòrts hòw màny rèspònsès wìll bè ìnclùdèd. •••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tap Export CSV. A confirmation dialog reports how many responses will be included." |
*
* @param {Demo_Guide_Export_Responses_Step4Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_export_responses_step4 = /** @type {((inputs?: Demo_Guide_Export_Responses_Step4Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Export_Responses_Step4Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_export_responses_step4(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_export_responses_step4(inputs)
	return en_demo_guide_export_responses_step4(inputs)
});