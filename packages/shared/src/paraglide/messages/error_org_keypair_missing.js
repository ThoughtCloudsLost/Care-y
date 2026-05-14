/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Org_Keypair_MissingInputs */

const en_error_org_keypair_missing = /** @type {(inputs: Error_Org_Keypair_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Organization setup is incomplete. Please restart the setup process.`)
};

const es_error_org_keypair_missing = /** @type {(inputs: Error_Org_Keypair_MissingInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La configuración de la organización está incompleta. Por favor, reinicie el proceso de configuración.`)
};

/**
* | output |
* | --- |
* | "Organization setup is incomplete. Please restart the setup process." |
*
* @param {Error_Org_Keypair_MissingInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_org_keypair_missing = /** @type {((inputs?: Error_Org_Keypair_MissingInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Org_Keypair_MissingInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_org_keypair_missing(inputs)
	return es_error_org_keypair_missing(inputs)
});