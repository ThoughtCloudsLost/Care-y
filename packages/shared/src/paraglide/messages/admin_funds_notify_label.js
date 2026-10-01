/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_Notify_LabelInputs */

const en_admin_funds_notify_label = /** @type {(inputs: Admin_Funds_Notify_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tell fund managers about every entry`)
};

const es_admin_funds_notify_label = /** @type {(inputs: Admin_Funds_Notify_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Avisar a quienes gestionan fondos de cada movimiento`)
};

const en_xa2_admin_funds_notify_label = /** @type {(inputs: Admin_Funds_Notify_LabelInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Tèll fùnd mànàgèrs àbòùt èvèry èntry •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Tell fund managers about every entry" |
*
* @param {Admin_Funds_Notify_LabelInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_notify_label = /** @type {((inputs?: Admin_Funds_Notify_LabelInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_Notify_LabelInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_notify_label(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_notify_label(inputs)
	return en_admin_funds_notify_label(inputs)
});