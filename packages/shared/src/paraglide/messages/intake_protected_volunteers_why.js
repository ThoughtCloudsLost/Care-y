/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_Volunteers_WhyInputs */

const en_intake_protected_volunteers_why = /** @type {(inputs: Intake_Protected_Volunteers_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Your information is encrypted before it leaves your device. The people who run the servers can never read it, and nobody outside the organization can see it. The organization can open it until someone takes your case; after that, access narrows to the specific people helping you.`)
};

const es_intake_protected_volunteers_why = /** @type {(inputs: Intake_Protected_Volunteers_WhyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tu información se cifra antes de salir de tu dispositivo. Las personas que administran los servidores nunca pueden leerla, y nadie fuera de la organización puede verla. La organización puede abrirla hasta que alguien tome tu caso; después, el acceso se reduce a las personas que te están ayudando.`)
};

/**
* | output |
* | --- |
* | "Your information is encrypted before it leaves your device. The people who run the servers can never read it, and nobody outside the organization can see it...." |
*
* @param {Intake_Protected_Volunteers_WhyInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_volunteers_why = /** @type {((inputs?: Intake_Protected_Volunteers_WhyInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_Volunteers_WhyInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_protected_volunteers_why(inputs)
	return en_intake_protected_volunteers_why(inputs)
});