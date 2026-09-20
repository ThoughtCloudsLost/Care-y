/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Move_DownInputs */

const en_intake_forms_move_down = /** @type {(inputs: Intake_Forms_Move_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move down`)
};

const es_intake_forms_move_down = /** @type {(inputs: Intake_Forms_Move_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Bajar`)
};

const en_xa2_intake_forms_move_down = /** @type {(inputs: Intake_Forms_Move_DownInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòvè dòwn •••⟧`)
};

/**
* | output |
* | --- |
* | "Move down" |
*
* @param {Intake_Forms_Move_DownInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_move_down = /** @type {((inputs?: Intake_Forms_Move_DownInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Move_DownInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_move_down(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_move_down(inputs)
	return en_intake_forms_move_down(inputs)
});