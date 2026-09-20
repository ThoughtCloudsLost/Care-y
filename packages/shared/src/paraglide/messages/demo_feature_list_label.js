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

const en_xa2_demo_feature_list_label = /** @type {(inputs: Demo_Feature_List_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Hàndbòòk fèàtùrès ••••••⟧`)
};

/**
* | output |
* | --- |
* | "Handbook features" |
*
* @param {Demo_Feature_List_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_feature_list_label = /** @type {((inputs?: Demo_Feature_List_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Feature_List_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_feature_list_label(inputs)
	if (locale === "en-XA") return en_xa2_demo_feature_list_label(inputs)
	return en_demo_feature_list_label(inputs)
});