/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_CancelInputs */

const en_portal_passphrase_cancel = /** @type {(inputs: Portal_Passphrase_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancel`)
};

const es_portal_passphrase_cancel = /** @type {(inputs: Portal_Passphrase_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cancelar`)
};

/**
* | output |
* | --- |
* | "Cancel" |
*
* @param {Portal_Passphrase_CancelInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_cancel = /** @type {((inputs?: Portal_Passphrase_CancelInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_CancelInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_portal_passphrase_cancel(inputs)
	return es_portal_passphrase_cancel(inputs)
});