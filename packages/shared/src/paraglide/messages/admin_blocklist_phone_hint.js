/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Phone_HintInputs */

const en_admin_blocklist_phone_hint = /** @type {(inputs: Admin_Blocklist_Phone_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the full number without the country code.`)
};

const es_admin_blocklist_phone_hint = /** @type {(inputs: Admin_Blocklist_Phone_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingrese el número completo sin el código de país.`)
};

const en_xa2_admin_blocklist_phone_hint = /** @type {(inputs: Admin_Blocklist_Phone_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èntèr thè fùll nùmbèr wìthòùt thè còùntry còdè. •••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Enter the full number without the country code." |
*
* @param {Admin_Blocklist_Phone_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_phone_hint = /** @type {((inputs?: Admin_Blocklist_Phone_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Phone_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_blocklist_phone_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_blocklist_phone_hint(inputs)
	return en_admin_blocklist_phone_hint(inputs)
});