/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Composer_Too_LongInputs */

const en_portal_composer_too_long = /** @type {(inputs: Portal_Composer_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This message is too long.`)
};

const es_portal_composer_too_long = /** @type {(inputs: Portal_Composer_Too_LongInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este mensaje es muy largo.`)
};

/**
* | output |
* | --- |
* | "This message is too long." |
*
* @param {Portal_Composer_Too_LongInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_composer_too_long = /** @type {((inputs?: Portal_Composer_Too_LongInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Composer_Too_LongInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_composer_too_long(inputs)
	return es_portal_composer_too_long(inputs)
});