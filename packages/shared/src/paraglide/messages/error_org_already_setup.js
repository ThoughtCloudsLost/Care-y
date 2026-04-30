/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Org_Already_SetupInputs */

const en_error_org_already_setup = /** @type {(inputs: Error_Org_Already_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This organization has already been set up.`)
};

const es_error_org_already_setup = /** @type {(inputs: Error_Org_Already_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta organización ya ha sido configurada.`)
};

/**
* | output |
* | --- |
* | "This organization has already been set up." |
*
* @param {Error_Org_Already_SetupInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_org_already_setup = /** @type {((inputs?: Error_Org_Already_SetupInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Org_Already_SetupInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_org_already_setup(inputs)
	return es_error_org_already_setup(inputs)
});