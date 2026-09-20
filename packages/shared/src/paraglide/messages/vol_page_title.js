/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Page_TitleInputs */

const en_vol_page_title = /** @type {(inputs: Vol_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Volunteer`)
};

const es_vol_page_title = /** @type {(inputs: Vol_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Voluntario`)
};

const en_xa2_vol_page_title = /** @type {(inputs: Vol_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vòlùntèèr •••⟧`)
};

/**
* | output |
* | --- |
* | "Volunteer" |
*
* @param {Vol_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_page_title = /** @type {((inputs?: Vol_Page_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Page_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_page_title(inputs)
	if (locale === "en-XA") return en_xa2_vol_page_title(inputs)
	return en_vol_page_title(inputs)
});