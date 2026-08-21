/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_SourceInputs */

const en_demo_flow_detail_source = /** @type {(inputs: Demo_Flow_Detail_SourceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Source`)
};

const es_demo_flow_detail_source = /** @type {(inputs: Demo_Flow_Detail_SourceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Origen`)
};

/**
* | output |
* | --- |
* | "Source" |
*
* @param {Demo_Flow_Detail_SourceInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_source = /** @type {((inputs?: Demo_Flow_Detail_SourceInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_SourceInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_source(inputs)
	return es_demo_flow_detail_source(inputs)
});