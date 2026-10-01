/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_DeactivatedInputs */

const en_admin_funds_deactivated = /** @type {(inputs: Admin_Funds_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund deactivated`)
};

const es_admin_funds_deactivated = /** @type {(inputs: Admin_Funds_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondo desactivado`)
};

const en_xa2_admin_funds_deactivated = /** @type {(inputs: Admin_Funds_DeactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd dèàctìvàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Fund deactivated" |
*
* @param {Admin_Funds_DeactivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_deactivated = /** @type {((inputs?: Admin_Funds_DeactivatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_DeactivatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_deactivated(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_deactivated(inputs)
	return en_admin_funds_deactivated(inputs)
});