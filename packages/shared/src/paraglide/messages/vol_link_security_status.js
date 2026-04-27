/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Link_Security_StatusInputs */

const en_vol_link_security_status = /** @type {(inputs: Vol_Link_Security_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View Security Status`)
};

const es_vol_link_security_status = /** @type {(inputs: Vol_Link_Security_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver Estado de Seguridad`)
};

/**
* | output |
* | --- |
* | "View Security Status" |
*
* @param {Vol_Link_Security_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_link_security_status = /** @type {((inputs?: Vol_Link_Security_StatusInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Link_Security_StatusInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_link_security_status(inputs)
	return es_vol_link_security_status(inputs)
});