/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Success_CloseInputs */

const en_portal_passphrase_success_close = /** @type {(inputs: Portal_Passphrase_Success_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Done`)
};

const es_portal_passphrase_success_close = /** @type {(inputs: Portal_Passphrase_Success_CloseInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Listo`)
};

/**
* | output |
* | --- |
* | "Done" |
*
* @param {Portal_Passphrase_Success_CloseInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_success_close = /** @type {((inputs?: Portal_Passphrase_Success_CloseInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Success_CloseInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_success_close(inputs)
	return es_portal_passphrase_success_close(inputs)
});