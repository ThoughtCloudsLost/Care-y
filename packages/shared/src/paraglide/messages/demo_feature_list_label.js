/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Feature_List_LabelInputs */

const en_demo_feature_list_label = /** @type {(inputs: Demo_Feature_List_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Handbook features`)
};

const es_demo_feature_list_label = /** @type {(inputs: Demo_Feature_List_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Funciones del manual`)
};

/**
* | output |
* | --- |
* | "Handbook features" |
*
* @param {Demo_Feature_List_LabelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const demo_feature_list_label = /** @type {((inputs?: Demo_Feature_List_LabelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Feature_List_LabelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_demo_feature_list_label(inputs)
	return es_demo_feature_list_label(inputs)
});