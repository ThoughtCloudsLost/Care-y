/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Kind_MetadataInputs */

const en_demo_flow_kind_metadata = /** @type {(inputs: Demo_Flow_Kind_MetadataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadata`)
};

const es_demo_flow_kind_metadata = /** @type {(inputs: Demo_Flow_Kind_MetadataInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Metadatos`)
};

/**
* | output |
* | --- |
* | "Metadata" |
*
* @param {Demo_Flow_Kind_MetadataInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_kind_metadata = /** @type {((inputs?: Demo_Flow_Kind_MetadataInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Kind_MetadataInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_kind_metadata(inputs)
	return es_demo_flow_kind_metadata(inputs)
});