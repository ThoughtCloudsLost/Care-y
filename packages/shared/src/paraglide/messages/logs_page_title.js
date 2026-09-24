/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Page_TitleInputs */

const en_logs_page_title = /** @type {(inputs: Logs_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Logs`)
};

const es_logs_page_title = /** @type {(inputs: Logs_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Registros`)
};

const en_xa2_logs_page_title = /** @type {(inputs: Logs_Page_TitleInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lògs ••⟧`)
};

/**
* | output |
* | --- |
* | "Logs" |
*
* @param {Logs_Page_TitleInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_page_title = /** @type {((inputs?: Logs_Page_TitleInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Page_TitleInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_page_title(inputs)
	if (locale === "en-XA") return en_xa2_logs_page_title(inputs)
	return en_logs_page_title(inputs)
});