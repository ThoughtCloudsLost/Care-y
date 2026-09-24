/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Common_Load_MoreInputs */

const en_common_load_more = /** @type {(inputs: Common_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Load more`)
};

const es_common_load_more = /** @type {(inputs: Common_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cargar más`)
};

const en_xa2_common_load_more = /** @type {(inputs: Common_Load_MoreInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Lòàd mòrè •••⟧`)
};

/**
* | output |
* | --- |
* | "Load more" |
*
* @param {Common_Load_MoreInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const common_load_more = /** @type {((inputs?: Common_Load_MoreInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Common_Load_MoreInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_common_load_more(inputs)
	if (locale === "en-XA") return en_xa2_common_load_more(inputs)
	return en_common_load_more(inputs)
});