/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Intake_Forms_Move_UpInputs */

const en_intake_forms_move_up = /** @type {(inputs: Intake_Forms_Move_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Move up`)
};

const es_intake_forms_move_up = /** @type {(inputs: Intake_Forms_Move_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Subir`)
};

const en_xa2_intake_forms_move_up = /** @type {(inputs: Intake_Forms_Move_UpInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Mòvè ùp •••⟧`)
};

/**
* | output |
* | --- |
* | "Move up" |
*
* @param {Intake_Forms_Move_UpInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_move_up = /** @type {((inputs?: Intake_Forms_Move_UpInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Move_UpInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_move_up(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_move_up(inputs)
	return en_intake_forms_move_up(inputs)
});