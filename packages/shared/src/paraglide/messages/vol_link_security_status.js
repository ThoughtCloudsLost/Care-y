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

const en_xa2_vol_link_security_status = /** @type {(inputs: Vol_Link_Security_StatusInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Vìèw Sècùrìty Stàtùs ••••••⟧`)
};

/**
* | output |
* | --- |
* | "View Security Status" |
*
* @param {Vol_Link_Security_StatusInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const vol_link_security_status = /** @type {((inputs?: Vol_Link_Security_StatusInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Link_Security_StatusInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_vol_link_security_status(inputs)
	if (locale === "en-XA") return en_xa2_vol_link_security_status(inputs)
	return en_vol_link_security_status(inputs)
});