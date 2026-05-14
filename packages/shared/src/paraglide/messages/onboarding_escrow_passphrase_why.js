/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Onboarding_Escrow_Passphrase_WhyInputs */

const en_onboarding_escrow_passphrase_why = /** @type {(inputs: Onboarding_Escrow_Passphrase_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Choose a passphrase to encrypt the backup file. You will need this passphrase to unlock the file during recovery. It is never stored anywhere, so if you forget it, the backup cannot be used.`)
};

const es_onboarding_escrow_passphrase_why = /** @type {(inputs: Onboarding_Escrow_Passphrase_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Elija una frase de contrasena para cifrar el archivo de respaldo. Necesitara esta frase para desbloquear el archivo durante la recuperacion. No se almacena en ningun lugar, asi que si la olvida, el respaldo no podra utilizarse.`)
};

/**
* | output |
* | --- |
* | "Choose a passphrase to encrypt the backup file. You will need this passphrase to unlock the file during recovery. It is never stored anywhere, so if you forg..." |
*
* @param {Onboarding_Escrow_Passphrase_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const onboarding_escrow_passphrase_why = /** @type {((inputs?: Onboarding_Escrow_Passphrase_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Onboarding_Escrow_Passphrase_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_onboarding_escrow_passphrase_why(inputs)
	return es_onboarding_escrow_passphrase_why(inputs)
});