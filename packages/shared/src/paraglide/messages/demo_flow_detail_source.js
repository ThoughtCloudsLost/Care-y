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

const en_xa2_demo_flow_detail_source = /** @type {(inputs: Demo_Flow_Detail_SourceInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sòùrcè ••⟧`)
};

/**
* | output |
* | --- |
* | "Source" |
*
* @param {Demo_Flow_Detail_SourceInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_source = /** @type {((inputs?: Demo_Flow_Detail_SourceInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_SourceInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_detail_source(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_detail_source(inputs)
	return en_demo_flow_detail_source(inputs)
});