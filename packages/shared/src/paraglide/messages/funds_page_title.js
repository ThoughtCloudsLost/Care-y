/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Funds_Page_TitleInputs */

const en_funds_page_title = /** @type {(inputs: Funds_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund ledger`)
};

const es_funds_page_title = /** @type {(inputs: Funds_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registro de fondos`)
};

const en_xa2_funds_page_title = /** @type {(inputs: Funds_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd lèdgèr ••••⟧`)
};

/**
* | output |
* | --- |
* | "Fund ledger" |
*
* @param {Funds_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const funds_page_title = /** @type {((inputs?: Funds_Page_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Funds_Page_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_funds_page_title(inputs)
	if (locale === "en-XA") return en_xa2_funds_page_title(inputs)
	return en_funds_page_title(inputs)
});