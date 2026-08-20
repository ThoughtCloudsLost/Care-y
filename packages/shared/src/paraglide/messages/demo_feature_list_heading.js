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

/**
* | output |
* | --- |
* | "Features" |
*
* @param {Demo_Feature_List_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_feature_list_heading = /** @type {((inputs?: Demo_Feature_List_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Feature_List_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_feature_list_heading(inputs)
	return es_demo_feature_list_heading(inputs)
});