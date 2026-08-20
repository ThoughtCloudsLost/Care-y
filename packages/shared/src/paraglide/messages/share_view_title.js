/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_TitleInputs */

const en_share_view_title = /** @type {(inputs: Share_View_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure message`)
};

const es_share_view_title = /** @type {(inputs: Share_View_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Mensaje seguro`)
};

/**
* | output |
* | --- |
* | "Secure message" |
*
* @param {Share_View_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_title = /** @type {((inputs?: Share_View_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_view_title(inputs)
	return es_share_view_title(inputs)
});