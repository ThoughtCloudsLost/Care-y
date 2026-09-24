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

const en_xa2_exposure_hint_remove_volunteer = /** @type {(inputs: Exposure_Hint_Remove_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs vòlùntèèr càn nò lòngèr àccèss nèw tìckèts. Thèy hàvè àlrèàdy sèèn dècryptèd còntènt fòr tìckèts thèy wèrè prèvìòùsly àssìgnèd tò. Thàt àccèss cànnòt bè ùndònè. ••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This volunteer can no longer access new tickets. They have already seen decrypted content for tickets they were previously assigned to. That access cannot be..." |
*
* @param {Exposure_Hint_Remove_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_remove_volunteer = /** @type {((inputs?: Exposure_Hint_Remove_VolunteerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_Remove_VolunteerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_exposure_hint_remove_volunteer(inputs)
	if (locale === "en-XA") return en_xa2_exposure_hint_remove_volunteer(inputs)
	return en_exposure_hint_remove_volunteer(inputs)
});