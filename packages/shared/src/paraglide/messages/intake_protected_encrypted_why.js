/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Encrypted_WhyInputs */

const en_intake_protected_encrypted_why = /** @type {(inputs: Intake_Protected_Encrypted_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Even if someone breaks into this server or seizes it, they cannot read what you wrote. Your information is locked and only unlocks for assigned volunteers.`)
};

const es_intake_protected_encrypted_why = /** @type {(inputs: Intake_Protected_Encrypted_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Aunque alguien acceda a este servidor o lo confisque, no podrá leer lo que escribiste. Tu información está bloqueada y solo se desbloquea para los voluntarios asignados.`)
};

const en_xa2_intake_protected_encrypted_why = /** @type {(inputs: Intake_Protected_Encrypted_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Èvèn ìf sòmèònè brèàks ìntò thìs sèrvèr òr sèìzès ìt, thèy cànnòt rèàd whàt yòù wròtè. Yòùr ìnfòrmàtìòn ìs lòckèd ànd ònly ùnlòcks fòr àssìgnèd vòlùntèèrs. •••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Even if someone breaks into this server or seizes it, they cannot read what you wrote. Your information is locked and only unlocks for assigned volunteers." |
*
* @param {Intake_Protected_Encrypted_WhyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_protected_encrypted_why = /** @type {((inputs?: Intake_Protected_Encrypted_WhyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Encrypted_WhyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_protected_encrypted_why(inputs)
	if (locale === "en-XA") return en_xa2_intake_protected_encrypted_why(inputs)
	return en_intake_protected_encrypted_why(inputs)
});