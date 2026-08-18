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

/**
* | output |
* | --- |
* | "Move up" |
*
* @param {Intake_Forms_Move_UpInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const intake_forms_move_up = /** @type {((inputs?: Intake_Forms_Move_UpInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Move_UpInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_intake_forms_move_up(inputs)
	return es_intake_forms_move_up(inputs)
});