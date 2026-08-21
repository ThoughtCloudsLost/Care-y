/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_ResultInputs */

const en_demo_flow_detail_result = /** @type {(inputs: Demo_Flow_Detail_ResultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Result`)
};

const es_demo_flow_detail_result = /** @type {(inputs: Demo_Flow_Detail_ResultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Resultado`)
};

/**
* | output |
* | --- |
* | "Result" |
*
* @param {Demo_Flow_Detail_ResultInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_result = /** @type {((inputs?: Demo_Flow_Detail_ResultInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_ResultInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_result(inputs)
	return es_demo_flow_detail_result(inputs)
});