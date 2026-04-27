/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Mgr_Link_Security_StatusInputs */

const en_mgr_link_security_status = /** @type {(inputs: Mgr_Link_Security_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`View Security Status`)
};

const es_mgr_link_security_status = /** @type {(inputs: Mgr_Link_Security_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ver Estado de Seguridad`)
};

/**
* | output |
* | --- |
* | "View Security Status" |
*
* @param {Mgr_Link_Security_StatusInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const mgr_link_security_status = /** @type {((inputs?: Mgr_Link_Security_StatusInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Mgr_Link_Security_StatusInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_mgr_link_security_status(inputs)
	return es_mgr_link_security_status(inputs)
});