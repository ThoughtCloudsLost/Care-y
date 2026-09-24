/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Preview_State_ClosedInputs */

const en_intake_forms_preview_state_closed = /** @type {(inputs: Intake_Forms_Preview_State_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Closed`)
};

const es_intake_forms_preview_state_closed = /** @type {(inputs: Intake_Forms_Preview_State_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Cerrado`)
};

const en_xa2_intake_forms_preview_state_closed = /** @type {(inputs: Intake_Forms_Preview_State_ClosedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Clòsèd ••⟧`)
};

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Intake_Forms_Preview_State_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview_state_closed = /** @type {((inputs?: Intake_Forms_Preview_State_ClosedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Preview_State_ClosedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_preview_state_closed(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_preview_state_closed(inputs)
	return en_intake_forms_preview_state_closed(inputs)
});