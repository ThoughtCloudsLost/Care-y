/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Guide_Verify_Server_Blindness_Step3Inputs */

const en_demo_guide_verify_server_blindness_step3 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Check each field against the plaintext columns the handbook entries list. Note which content appeared only after decryption.`)
};

const es_demo_guide_verify_server_blindness_step3 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Compara cada campo con las columnas en texto plano que listan las entradas del manual. Observa qué contenido apareció solo tras el descifrado.`)
};

const en_xa2_demo_guide_verify_server_blindness_step3 = /** @type {(inputs: Demo_Guide_Verify_Server_Blindness_Step3Inputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Chèck èàch fìèld àgàìnst thè plàìntèxt còlùmns thè hàndbòòk èntrìès lìst. Nòtè whìch còntènt àppèàrèd ònly àftèr dècryptìòn. ••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Check each field against the plaintext columns the handbook entries list. Note which content appeared only after decryption." |
*
* @param {Demo_Guide_Verify_Server_Blindness_Step3Inputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_guide_verify_server_blindness_step3 = /** @type {((inputs?: Demo_Guide_Verify_Server_Blindness_Step3Inputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Guide_Verify_Server_Blindness_Step3Inputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_guide_verify_server_blindness_step3(inputs)
	if (locale === "en-XA") return en_xa2_demo_guide_verify_server_blindness_step3(inputs)
	return en_demo_guide_verify_server_blindness_step3(inputs)
});