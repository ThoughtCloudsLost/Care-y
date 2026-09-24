/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Logs_Load_MoreInputs */

const en_logs_load_more = /** @type {(inputs: Logs_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load more`)
};

const es_logs_load_more = /** @type {(inputs: Logs_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargar más`)
};

const en_xa2_logs_load_more = /** @type {(inputs: Logs_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàd mòrè •••⟧`)
};

/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Logs_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const logs_load_more = /** @type {((inputs?: Logs_Load_MoreInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Logs_Load_MoreInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_logs_load_more(inputs)
	if (locale === "en-XA") return en_xa2_logs_load_more(inputs)
	return en_logs_load_more(inputs)
});