/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Notify_Off_HintInputs */

const en_admin_funds_notify_off_hint = /** @type {(inputs: Admin_Funds_Notify_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund managers are not told when someone records an entry.`)
};

const es_admin_funds_notify_off_hint = /** @type {(inputs: Admin_Funds_Notify_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Quienes gestionan fondos no reciben aviso cuando alguien registra un movimiento.`)
};

const en_xa2_admin_funds_notify_off_hint = /** @type {(inputs: Admin_Funds_Notify_Off_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd mànàgèrs àrè nòt tòld whèn sòmèònè rècòrds àn èntry. ••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Fund managers are not told when someone records an entry." |
*
* @param {Admin_Funds_Notify_Off_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_notify_off_hint = /** @type {((inputs?: Admin_Funds_Notify_Off_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Notify_Off_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_notify_off_hint(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_notify_off_hint(inputs)
	return en_admin_funds_notify_off_hint(inputs)
});