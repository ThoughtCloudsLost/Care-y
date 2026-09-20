/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ Manager: NonNullable<unknown> }} Mgr_Page_TitleInputs */

const en_mgr_page_title = /** @type {(inputs: Mgr_Page_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Manager}`)
};

const es_mgr_page_title = /** @type {(inputs: Mgr_Page_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`${i?.Manager}`)
};

const en_xa2_mgr_page_title = /** @type {(inputs: Mgr_Page_TitleInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦${i?.Manager}⟧`)
};

/**
* | output |
* | --- |
* | "{Manager}" |
*
* @param {Mgr_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const mgr_page_title = /** @type {((inputs: Mgr_Page_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Page_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_mgr_page_title(inputs)
	if (locale === "en-XA") return en_xa2_mgr_page_title(inputs)
	return en_mgr_page_title(inputs)
});