/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Web_Intake_Disabled_HintInputs */

const en_intake_forms_web_intake_disabled_hint = /** @type {(inputs: Intake_Forms_Web_Intake_Disabled_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When off, all intake pages show a not-available message.`)
};

const es_intake_forms_web_intake_disabled_hint = /** @type {(inputs: Intake_Forms_Web_Intake_Disabled_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando esta desactivada, todas las paginas de recepcion muestran un mensaje de no disponible.`)
};

/**
* | output |
* | --- |
* | "When off, all intake pages show a not-available message." |
*
* @param {Intake_Forms_Web_Intake_Disabled_HintInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_web_intake_disabled_hint = /** @type {((inputs?: Intake_Forms_Web_Intake_Disabled_HintInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Web_Intake_Disabled_HintInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_web_intake_disabled_hint(inputs)
	return es_intake_forms_web_intake_disabled_hint(inputs)
});