/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_InputInputs */

const en_demo_flow_detail_input = /** @type {(inputs: Demo_Flow_Detail_InputInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Input`)
};

const es_demo_flow_detail_input = /** @type {(inputs: Demo_Flow_Detail_InputInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Entrada`)
};

/**
* | output |
* | --- |
* | "Input" |
*
* @param {Demo_Flow_Detail_InputInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_input = /** @type {((inputs?: Demo_Flow_Detail_InputInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_InputInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_flow_detail_input(inputs)
	return es_demo_flow_detail_input(inputs)
});