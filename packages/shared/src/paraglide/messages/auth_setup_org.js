/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Auth_Setup_OrgInputs */

const en_auth_setup_org = /** @type {(inputs: Auth_Setup_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Set up your organization`)
};

const es_auth_setup_org = /** @type {(inputs: Auth_Setup_OrgInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Configura tu organizacion`)
};

/**
* | output |
* | --- |
* | "Set up your organization" |
*
* @param {Auth_Setup_OrgInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const auth_setup_org = /** @type {((inputs?: Auth_Setup_OrgInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Auth_Setup_OrgInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_auth_setup_org(inputs)
	return es_auth_setup_org(inputs)
});