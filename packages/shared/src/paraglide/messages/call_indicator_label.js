/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Call_Indicator_LabelInputs */

const en_call_indicator_label = /** @type {(inputs: Call_Indicator_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Call in progress`)
};

const es_call_indicator_label = /** @type {(inputs: Call_Indicator_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Llamada en curso`)
};

const en_xa2_call_indicator_label = /** @type {(inputs: Call_Indicator_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càll ìn prògrèss •••••⟧`)
};

/**
* | output |
* | --- |
* | "Call in progress" |
*
* @param {Call_Indicator_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const call_indicator_label = /** @type {((inputs?: Call_Indicator_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Call_Indicator_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_call_indicator_label(inputs)
	if (locale === "en-XA") return en_xa2_call_indicator_label(inputs)
	return en_call_indicator_label(inputs)
});