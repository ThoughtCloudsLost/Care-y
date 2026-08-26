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

/**
* | output |
* | --- |
* | "Both callers have a portal link" |
*
* @param {Merge_Channel_Choice_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const merge_channel_choice_heading = /** @type {((inputs?: Merge_Channel_Choice_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Merge_Channel_Choice_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_merge_channel_choice_heading(inputs)
	return es_merge_channel_choice_heading(inputs)
});