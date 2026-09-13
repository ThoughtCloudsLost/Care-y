/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_View_Not_Found_TitleInputs */

const en_share_view_not_found_title = /** @type {(inputs: Share_View_Not_Found_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Link not found`)
};

const es_share_view_not_found_title = /** @type {(inputs: Share_View_Not_Found_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace no encontrado`)
};

/**
* | output |
* | --- |
* | "Link not found" |
*
* @param {Share_View_Not_Found_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_view_not_found_title = /** @type {((inputs?: Share_View_Not_Found_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_Not_Found_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_view_not_found_title(inputs)
	return es_share_view_not_found_title(inputs)
});