/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} View_Switcher_LabelInputs */

const en_view_switcher_label = /** @type {(inputs: View_Switcher_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View as`)
};

const es_view_switcher_label = /** @type {(inputs: View_Switcher_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver como`)
};

const en_xa2_view_switcher_label = /** @type {(inputs: View_Switcher_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw às •••⟧`)
};

/**
* | output |
* | --- |
* | "View as" |
*
* @param {View_Switcher_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const view_switcher_label = /** @type {((inputs?: View_Switcher_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<View_Switcher_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_view_switcher_label(inputs)
	if (locale === "en-XA") return en_xa2_view_switcher_label(inputs)
	return en_view_switcher_label(inputs)
});