/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Roles_Reset_ActionInputs */

const en_roles_reset_action = /** @type {(inputs: Roles_Reset_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Reset`)
};

const es_roles_reset_action = /** @type {(inputs: Roles_Reset_ActionInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Restablecer`)
};

/**
* | output |
* | --- |
* | "Reset" |
*
* @param {Roles_Reset_ActionInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const roles_reset_action = /** @type {((inputs?: Roles_Reset_ActionInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Roles_Reset_ActionInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_roles_reset_action(inputs)
	return es_roles_reset_action(inputs)
});