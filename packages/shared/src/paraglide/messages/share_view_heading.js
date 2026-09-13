/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_HeadingInputs */

const en_share_view_heading = /** @type {(inputs: Share_View_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`A message for you`)
};

const es_share_view_heading = /** @type {(inputs: Share_View_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Un mensaje para ti`)
};

/**
* | output |
* | --- |
* | "A message for you" |
*
* @param {Share_View_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_heading = /** @type {((inputs?: Share_View_HeadingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_HeadingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_view_heading(inputs)
	return es_share_view_heading(inputs)
});