/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Closes_At_Hint_With_MessageInputs */

const en_intake_forms_closes_at_hint_with_message = /** @type {(inputs: Intake_Forms_Closes_At_Hint_With_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`After this date, the form shows the closed message instead of accepting submissions.`)
};

const es_intake_forms_closes_at_hint_with_message = /** @type {(inputs: Intake_Forms_Closes_At_Hint_With_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Tras esta fecha, el formulario muestra el mensaje de cierre en vez de aceptar envíos.`)
};

const en_xa2_intake_forms_closes_at_hint_with_message = /** @type {(inputs: Intake_Forms_Closes_At_Hint_With_MessageInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Àftèr thìs dàtè, thè fòrm shòws thè clòsèd mèssàgè ìnstèàd òf àccèptìng sùbmìssìòns. ••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "After this date, the form shows the closed message instead of accepting submissions." |
*
* @param {Intake_Forms_Closes_At_Hint_With_MessageInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_closes_at_hint_with_message = /** @type {((inputs?: Intake_Forms_Closes_At_Hint_With_MessageInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Closes_At_Hint_With_MessageInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_closes_at_hint_with_message(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_closes_at_hint_with_message(inputs)
	return en_intake_forms_closes_at_hint_with_message(inputs)
});