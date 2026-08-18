/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Encrypted_WhyInputs */

const en_intake_protected_encrypted_why = /** @type {(inputs: Intake_Protected_Encrypted_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Even if someone breaks into this server or seizes it, they cannot read what you wrote. Your information is locked and only unlocks for assigned volunteers.`)
};

const es_intake_protected_encrypted_why = /** @type {(inputs: Intake_Protected_Encrypted_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aunque alguien acceda a este servidor o lo confisque, no podra leer lo que escribiste. Tu informacion esta bloqueada y solo se desbloquea para los voluntarios asignados.`)
};

/**
* | output |
* | --- |
* | "Even if someone breaks into this server or seizes it, they cannot read what you wrote. Your information is locked and only unlocks for assigned volunteers." |
*
* @param {Intake_Protected_Encrypted_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_encrypted_why = /** @type {((inputs?: Intake_Protected_Encrypted_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Encrypted_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_protected_encrypted_why(inputs)
	return es_intake_protected_encrypted_why(inputs)
});