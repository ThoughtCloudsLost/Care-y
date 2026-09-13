/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_EncryptedInputs */

const en_intake_privacy_encrypted = /** @type {(inputs: Intake_Privacy_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your answer is encrypted. The service cannot read it.`)
};

const es_intake_privacy_encrypted = /** @type {(inputs: Intake_Privacy_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su respuesta esta cifrada. El servicio no puede leerla.`)
};

/**
* | output |
* | --- |
* | "Your answer is encrypted. The service cannot read it." |
*
* @param {Intake_Privacy_EncryptedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_encrypted = /** @type {((inputs?: Intake_Privacy_EncryptedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_EncryptedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_privacy_encrypted(inputs)
	return es_intake_privacy_encrypted(inputs)
});