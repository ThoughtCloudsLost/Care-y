/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Passphrase_Add_ButtonInputs */

const en_portal_passphrase_add_button = /** @type {(inputs: Portal_Passphrase_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Add`)
};

const es_portal_passphrase_add_button = /** @type {(inputs: Portal_Passphrase_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Agregar`)
};

const en_xa2_portal_passphrase_add_button = /** @type {(inputs: Portal_Passphrase_Add_ButtonInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àdd •⟧`)
};

/**
* | output |
* | --- |
* | "Add" |
*
* @param {Portal_Passphrase_Add_ButtonInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const portal_passphrase_add_button = /** @type {((inputs?: Portal_Passphrase_Add_ButtonInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Passphrase_Add_ButtonInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_passphrase_add_button(inputs)
	if (locale === "en-XA") return en_xa2_portal_passphrase_add_button(inputs)
	return en_portal_passphrase_add_button(inputs)
});