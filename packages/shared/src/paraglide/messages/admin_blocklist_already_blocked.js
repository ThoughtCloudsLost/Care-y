/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Already_BlockedInputs */

const en_admin_blocklist_already_blocked = /** @type {(inputs: Admin_Blocklist_Already_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This number is already blocked.`)
};

const es_admin_blocklist_already_blocked = /** @type {(inputs: Admin_Blocklist_Already_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este número ya está bloqueado.`)
};

const en_xa2_admin_blocklist_already_blocked = /** @type {(inputs: Admin_Blocklist_Already_BlockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs nùmbèr ìs àlrèàdy blòckèd. ••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This number is already blocked." |
*
* @param {Admin_Blocklist_Already_BlockedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_already_blocked = /** @type {((inputs?: Admin_Blocklist_Already_BlockedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Already_BlockedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_already_blocked(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_already_blocked(inputs)
	return en_admin_blocklist_already_blocked(inputs)
});