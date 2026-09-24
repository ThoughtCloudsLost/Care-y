/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Web_Intake_Disabled_HintInputs */

const en_intake_forms_web_intake_disabled_hint = /** @type {(inputs: Intake_Forms_Web_Intake_Disabled_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`When off, all intake pages show a not-available message.`)
};

const es_intake_forms_web_intake_disabled_hint = /** @type {(inputs: Intake_Forms_Web_Intake_Disabled_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cuando está desactivada, todas las páginas de recepción muestran un mensaje de no disponible.`)
};

const en_xa2_intake_forms_web_intake_disabled_hint = /** @type {(inputs: Intake_Forms_Web_Intake_Disabled_HintInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Whèn òff, àll ìntàkè pàgès shòw à nòt-àvàìlàblè mèssàgè. •••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "When off, all intake pages show a not-available message." |
*
* @param {Intake_Forms_Web_Intake_Disabled_HintInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_web_intake_disabled_hint = /** @type {((inputs?: Intake_Forms_Web_Intake_Disabled_HintInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Web_Intake_Disabled_HintInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_web_intake_disabled_hint(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_web_intake_disabled_hint(inputs)
	return en_intake_forms_web_intake_disabled_hint(inputs)
});