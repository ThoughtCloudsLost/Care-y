/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Merge_Channel_Choice_HeadingInputs */

const en_merge_channel_choice_heading = /** @type {(inputs: Merge_Channel_Choice_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Both callers have a portal link`)
};

const es_merge_channel_choice_heading = /** @type {(inputs: Merge_Channel_Choice_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ambas personas tienen un enlace del portal`)
};

const en_xa2_merge_channel_choice_heading = /** @type {(inputs: Merge_Channel_Choice_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bòth càllèrs hàvè à pòrtàl lìnk ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Both callers have a portal link" |
*
* @param {Merge_Channel_Choice_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const merge_channel_choice_heading = /** @type {((inputs?: Merge_Channel_Choice_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Merge_Channel_Choice_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_merge_channel_choice_heading(inputs)
	if (locale === "en-XA") return en_xa2_merge_channel_choice_heading(inputs)
	return en_merge_channel_choice_heading(inputs)
});