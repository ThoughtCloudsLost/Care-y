/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Exposure_Hint_Remove_VolunteerInputs */

const en_exposure_hint_remove_volunteer = /** @type {(inputs: Exposure_Hint_Remove_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This volunteer can no longer access new tickets. They have already seen decrypted content for tickets they were previously assigned to. That access cannot be undone.`)
};

const es_exposure_hint_remove_volunteer = /** @type {(inputs: Exposure_Hint_Remove_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Este voluntario ya no podrá acceder a tickets nuevos. Ya ha visto contenido descifrado de tickets que le fueron asignados anteriormente. Ese acceso no se puede deshacer.`)
};

/**
* | output |
* | --- |
* | "This volunteer can no longer access new tickets. They have already seen decrypted content for tickets they were previously assigned to. That access cannot be..." |
*
* @param {Exposure_Hint_Remove_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_remove_volunteer = /** @type {((inputs?: Exposure_Hint_Remove_VolunteerInputs, options?: { locale?: "en" | "es" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_Remove_VolunteerInputs, { locale?: "en" | "es" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "en") return en_exposure_hint_remove_volunteer(inputs)
	return es_exposure_hint_remove_volunteer(inputs)
});