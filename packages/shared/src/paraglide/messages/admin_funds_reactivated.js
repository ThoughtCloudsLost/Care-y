/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Funds_ReactivatedInputs */

const en_admin_funds_reactivated = /** @type {(inputs: Admin_Funds_ReactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fund reactivated`)
};

const es_admin_funds_reactivated = /** @type {(inputs: Admin_Funds_ReactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Fondo reactivado`)
};

const en_xa2_admin_funds_reactivated = /** @type {(inputs: Admin_Funds_ReactivatedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Fùnd rèàctìvàtèd •••••⟧`)
};

/**
* | output |
* | --- |
* | "Fund reactivated" |
*
* @param {Admin_Funds_ReactivatedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_funds_reactivated = /** @type {((inputs?: Admin_Funds_ReactivatedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Funds_ReactivatedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_funds_reactivated(inputs)
	if (locale === "en-XA") return en_xa2_admin_funds_reactivated(inputs)
	return en_admin_funds_reactivated(inputs)
});