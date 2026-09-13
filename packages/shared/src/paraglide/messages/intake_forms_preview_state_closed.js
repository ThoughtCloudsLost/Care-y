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

/**
* | output |
* | --- |
* | "Closed" |
*
* @param {Intake_Forms_Preview_State_ClosedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_preview_state_closed = /** @type {((inputs?: Intake_Forms_Preview_State_ClosedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Preview_State_ClosedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_preview_state_closed(inputs)
	return es_intake_forms_preview_state_closed(inputs)
});