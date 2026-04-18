/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Hub_Badge_Retention_DisabledInputs */

const en_admin_hub_badge_retention_disabled = /** @type {(inputs: Admin_Hub_Badge_Retention_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Disabled`)
};

const es_admin_hub_badge_retention_disabled = /** @type {(inputs: Admin_Hub_Badge_Retention_DisabledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactivado`)
};

/**
* | output |
* | --- |
* | "Disabled" |
*
* @param {Admin_Hub_Badge_Retention_DisabledInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const admin_hub_badge_retention_disabled = /** @type {((inputs?: Admin_Hub_Badge_Retention_DisabledInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Hub_Badge_Retention_DisabledInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_admin_hub_badge_retention_disabled(inputs)
	return es_admin_hub_badge_retention_disabled(inputs)
});