/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Protected_SummaryInputs */

const en_intake_protected_summary = /** @type {(inputs: Intake_Protected_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`What you write here is encrypted before it leaves your device. Only assigned volunteers can read it. Even if someone breaks into this server, they cannot read your messages.`)
};

const es_intake_protected_summary = /** @type {(inputs: Intake_Protected_SummaryInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Lo que escribas aqui se cifra antes de salir de tu dispositivo. Solo los voluntarios asignados pueden leerlo. Aunque alguien acceda a este servidor, no podra leer tus mensajes.`)
};

/**
* | output |
* | --- |
* | "What you write here is encrypted before it leaves your device. Only assigned volunteers can read it. Even if someone breaks into this server, they cannot rea..." |
*
* @param {Intake_Protected_SummaryInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_protected_summary = /** @type {((inputs?: Intake_Protected_SummaryInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Protected_SummaryInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_protected_summary(inputs)
	return es_intake_protected_summary(inputs)
});