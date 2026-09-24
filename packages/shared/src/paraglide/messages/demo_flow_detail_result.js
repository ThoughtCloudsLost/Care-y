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

const en_xa2_demo_flow_detail_result = /** @type {(inputs: Demo_Flow_Detail_ResultInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Rèsùlt ••⟧`)
};

/**
* | output |
* | --- |
* | "Result" |
*
* @param {Demo_Flow_Detail_ResultInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_result = /** @type {((inputs?: Demo_Flow_Detail_ResultInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_ResultInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_detail_result(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_detail_result(inputs)
	return en_demo_flow_detail_result(inputs)
});