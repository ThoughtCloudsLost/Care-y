/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Setup_OrgInputs */

const en_auth_setup_org = /** @type {(inputs: Auth_Setup_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up your organization`)
};

const es_auth_setup_org = /** @type {(inputs: Auth_Setup_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configura tu organización`)
};

const en_xa2_auth_setup_org = /** @type {(inputs: Auth_Setup_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Sèt ùp yòùr òrgànìzàtìòn ••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Set up your organization" |
*
* @param {Auth_Setup_OrgInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const auth_setup_org = /** @type {((inputs?: Auth_Setup_OrgInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Setup_OrgInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_auth_setup_org(inputs)
	if (locale === "en-XA") return en_xa2_auth_setup_org(inputs)
	return en_auth_setup_org(inputs)
});