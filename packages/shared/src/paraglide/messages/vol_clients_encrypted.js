/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Vol_Clients_EncryptedInputs */

const en_vol_clients_encrypted = /** @type {(inputs: Vol_Clients_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`All client information is encrypted before it reaches the server. Only your team can decrypt it.`)
};

const es_vol_clients_encrypted = /** @type {(inputs: Vol_Clients_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Toda la informacion del cliente se cifra antes de llegar al servidor. Solo tu equipo puede descifrarla.`)
};

/**
* | output |
* | --- |
* | "All client information is encrypted before it reaches the server. Only your team can decrypt it." |
*
* @param {Vol_Clients_EncryptedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const vol_clients_encrypted = /** @type {((inputs?: Vol_Clients_EncryptedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Vol_Clients_EncryptedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_vol_clients_encrypted(inputs)
	return es_vol_clients_encrypted(inputs)
});