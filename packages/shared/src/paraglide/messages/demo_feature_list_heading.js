/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Feature_List_HeadingInputs */

const en_demo_feature_list_heading = /** @type {(inputs: Demo_Feature_List_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Features`)
};

const es_demo_feature_list_heading = /** @type {(inputs: Demo_Feature_List_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Funciones`)
};

const en_xa2_demo_feature_list_heading = /** @type {(inputs: Demo_Feature_List_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fèàtùrès •••⟧`)
};

/**
* | output |
* | --- |
* | "Features" |
*
* @param {Demo_Feature_List_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_feature_list_heading = /** @type {((inputs?: Demo_Feature_List_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Feature_List_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_feature_list_heading(inputs)
	if (locale === "en-XA") return en_xa2_demo_feature_list_heading(inputs)
	return en_demo_feature_list_heading(inputs)
});