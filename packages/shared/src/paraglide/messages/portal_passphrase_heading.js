/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_HeadingInputs */

const en_portal_passphrase_heading = /** @type {(inputs: Portal_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Secure link`)
};

const es_portal_passphrase_heading = /** @type {(inputs: Portal_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enlace seguro`)
};

const en_xa2_portal_passphrase_heading = /** @type {(inputs: Portal_Passphrase_HeadingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sècùrè lìnk ••••⟧`)
};

/**
* | output |
* | --- |
* | "Secure link" |
*
* @param {Portal_Passphrase_HeadingInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_heading = /** @type {((inputs?: Portal_Passphrase_HeadingInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_HeadingInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_heading(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_heading(inputs)
	return en_portal_passphrase_heading(inputs)
});