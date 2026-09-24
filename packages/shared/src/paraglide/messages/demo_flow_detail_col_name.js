/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Flow_Detail_Col_NameInputs */

const en_demo_flow_detail_col_name = /** @type {(inputs: Demo_Flow_Detail_Col_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Name`)
};

const es_demo_flow_detail_col_name = /** @type {(inputs: Demo_Flow_Detail_Col_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Nombre`)
};

const en_xa2_demo_flow_detail_col_name = /** @type {(inputs: Demo_Flow_Detail_Col_NameInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Nàmè ••⟧`)
};

/**
* | output |
* | --- |
* | "Name" |
*
* @param {Demo_Flow_Detail_Col_NameInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_flow_detail_col_name = /** @type {((inputs?: Demo_Flow_Detail_Col_NameInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Flow_Detail_Col_NameInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_flow_detail_col_name(inputs)
	if (locale === "en-XA") return en_xa2_demo_flow_detail_col_name(inputs)
	return en_demo_flow_detail_col_name(inputs)
});