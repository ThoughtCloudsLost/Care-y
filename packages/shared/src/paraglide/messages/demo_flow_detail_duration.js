/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_DurationInputs */

const en_demo_flow_detail_duration = /** @type {(inputs: Demo_Flow_Detail_DurationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Duration`)
};

const es_demo_flow_detail_duration = /** @type {(inputs: Demo_Flow_Detail_DurationInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Duración`)
};

/**
* | output |
* | --- |
* | "Duration" |
*
* @param {Demo_Flow_Detail_DurationInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_duration = /** @type {((inputs?: Demo_Flow_Detail_DurationInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_DurationInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_duration(inputs)
	return es_demo_flow_detail_duration(inputs)
});