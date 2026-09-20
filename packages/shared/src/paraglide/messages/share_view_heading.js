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

const en_xa2_share_view_heading = /** @type {(inputs: Share_View_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦À mèssàgè fòr yòù ••••••⟧`)
};

/**
* | output |
* | --- |
* | "A message for you" |
*
* @param {Share_View_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_heading = /** @type {((inputs?: Share_View_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_heading(inputs)
	if (locale === "en-XA") return en_xa2_share_view_heading(inputs)
	return en_share_view_heading(inputs)
});