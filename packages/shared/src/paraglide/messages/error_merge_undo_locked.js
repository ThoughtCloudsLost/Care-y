/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Error_Merge_Undo_LockedInputs */

const en_error_merge_undo_locked = /** @type {(inputs: Error_Merge_Undo_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This merge undo is locked.`)
};

const es_error_merge_undo_locked = /** @type {(inputs: Error_Merge_Undo_LockedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`La reversión de esta fusión está bloqueada.`)
};

/**
* | output |
* | --- |
* | "This merge undo is locked." |
*
* @param {Error_Merge_Undo_LockedInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const error_merge_undo_locked = /** @type {((inputs?: Error_Merge_Undo_LockedInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Error_Merge_Undo_LockedInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_error_merge_undo_locked(inputs)
	return es_error_merge_undo_locked(inputs)
});