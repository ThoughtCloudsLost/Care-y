/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Privacy_EncryptedInputs */

const en_intake_privacy_encrypted = /** @type {(inputs: Intake_Privacy_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your answer is encrypted. The service cannot read it.`)
};

const es_intake_privacy_encrypted = /** @type {(inputs: Intake_Privacy_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Su respuesta está cifrada. El servicio no puede leerla.`)
};

const en_xa2_intake_privacy_encrypted = /** @type {(inputs: Intake_Privacy_EncryptedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Yòùr ànswèr ìs èncryptèd. Thè sèrvìcè cànnòt rèàd ìt. ••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Your answer is encrypted. The service cannot read it." |
*
* @param {Intake_Privacy_EncryptedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_privacy_encrypted = /** @type {((inputs?: Intake_Privacy_EncryptedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Privacy_EncryptedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_privacy_encrypted(inputs)
	if (locale === "en-XA") return en_xa2_intake_privacy_encrypted(inputs)
	return en_intake_privacy_encrypted(inputs)
});