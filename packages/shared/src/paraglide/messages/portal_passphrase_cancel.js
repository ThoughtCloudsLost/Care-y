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

const en_xa2_portal_passphrase_cancel = /** @type {(inputs: Portal_Passphrase_CancelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Càncèl ••⟧`)
};

/**
* | output |
* | --- |
* | "Cancel" |
*
* @param {Portal_Passphrase_CancelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_cancel = /** @type {((inputs?: Portal_Passphrase_CancelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_CancelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_cancel(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_cancel(inputs)
	return en_portal_passphrase_cancel(inputs)
});