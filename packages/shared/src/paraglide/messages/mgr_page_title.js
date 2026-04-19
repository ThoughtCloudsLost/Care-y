/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Page_TitleInputs */

const en_mgr_page_title = /** @type {(inputs: Mgr_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Manager`)
};

const es_mgr_page_title = /** @type {(inputs: Mgr_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Gerente`)
};

/**
* | output |
* | --- |
* | "Manager" |
*
* @param {Mgr_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_page_title = /** @type {((inputs?: Mgr_Page_TitleInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Page_TitleInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_page_title(inputs)
	return es_mgr_page_title(inputs)
});