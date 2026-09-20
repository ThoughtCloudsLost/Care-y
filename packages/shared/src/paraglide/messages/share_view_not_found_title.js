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

const en_xa2_share_view_not_found_title = /** @type {(inputs: Share_View_Not_Found_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lìnk nòt fòùnd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Link not found" |
*
* @param {Share_View_Not_Found_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const share_view_not_found_title = /** @type {((inputs?: Share_View_Not_Found_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_View_Not_Found_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_share_view_not_found_title(inputs)
	if (locale === "en-XA") return en_xa2_share_view_not_found_title(inputs)
	return en_share_view_not_found_title(inputs)
});