/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Share_Status_ExpiredInputs */

const en_share_status_expired = /** @type {(inputs: Share_Status_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expired`)
};

const es_share_status_expired = /** @type {(inputs: Share_Status_ExpiredInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Expirado`)
};

/**
* | output |
* | --- |
* | "Expired" |
*
* @param {Share_Status_ExpiredInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const share_status_expired = /** @type {((inputs?: Share_Status_ExpiredInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Share_Status_ExpiredInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_share_status_expired(inputs)
	return es_share_status_expired(inputs)
});