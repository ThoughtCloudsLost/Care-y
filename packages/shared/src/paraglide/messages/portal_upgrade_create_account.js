/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Portal_Upgrade_Create_AccountInputs */

const en_portal_upgrade_create_account = /** @type {(inputs: Portal_Upgrade_Create_AccountInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Create an account`)
};

const es_portal_upgrade_create_account = /** @type {(inputs: Portal_Upgrade_Create_AccountInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Crear una cuenta`)
};

/**
* | output |
* | --- |
* | "Create an account" |
*
* @param {Portal_Upgrade_Create_AccountInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const portal_upgrade_create_account = /** @type {((inputs?: Portal_Upgrade_Create_AccountInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Portal_Upgrade_Create_AccountInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_portal_upgrade_create_account(inputs)
	return en_portal_upgrade_create_account(inputs)
});