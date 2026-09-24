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

const en_xa2_error_org_already_setup = /** @type {(inputs: Error_Org_Already_SetupInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs òrgànìzàtìòn hàs àlrèàdy bèèn sèt ùp. •••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This organization has already been set up." |
*
* @param {Error_Org_Already_SetupInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const error_org_already_setup = /** @type {((inputs?: Error_Org_Already_SetupInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Org_Already_SetupInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_error_org_already_setup(inputs)
	if (locale === "en-XA") return en_xa2_error_org_already_setup(inputs)
	return en_error_org_already_setup(inputs)
});