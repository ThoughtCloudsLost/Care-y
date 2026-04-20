/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Blocklist_Phone_HintInputs */

const en_admin_blocklist_phone_hint = /** @type {(inputs: Admin_Blocklist_Phone_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Enter the full number without the country code.`)
};

const es_admin_blocklist_phone_hint = /** @type {(inputs: Admin_Blocklist_Phone_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Ingrese el numero completo sin el codigo de pais.`)
};

/**
* | output |
* | --- |
* | "Enter the full number without the country code." |
*
* @param {Admin_Blocklist_Phone_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_blocklist_phone_hint = /** @type {((inputs?: Admin_Blocklist_Phone_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Blocklist_Phone_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_blocklist_phone_hint(inputs)
	return es_admin_blocklist_phone_hint(inputs)
});