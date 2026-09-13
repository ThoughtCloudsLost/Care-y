/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Group_High_TrustInputs */

const en_roles_group_high_trust = /** @type {(inputs: Roles_Group_High_TrustInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`High trust`)
};

const es_roles_group_high_trust = /** @type {(inputs: Roles_Group_High_TrustInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Alta confianza`)
};

/**
* | output |
* | --- |
* | "High trust" |
*
* @param {Roles_Group_High_TrustInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_group_high_trust = /** @type {((inputs?: Roles_Group_High_TrustInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Group_High_TrustInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_group_high_trust(inputs)
	return es_roles_group_high_trust(inputs)
});