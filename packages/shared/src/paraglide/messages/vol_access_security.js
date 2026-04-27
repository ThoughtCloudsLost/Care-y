/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Access_SecurityInputs */

const en_vol_access_security = /** @type {(inputs: Vol_Access_SecurityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View your security status`)
};

const es_vol_access_security = /** @type {(inputs: Vol_Access_SecurityInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver tu estado de seguridad`)
};

/**
* | output |
* | --- |
* | "View your security status" |
*
* @param {Vol_Access_SecurityInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_access_security = /** @type {((inputs?: Vol_Access_SecurityInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Access_SecurityInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_access_security(inputs)
	return es_vol_access_security(inputs)
});