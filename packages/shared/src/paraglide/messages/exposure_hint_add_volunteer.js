/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Exposure_Hint_Add_VolunteerInputs */

const en_exposure_hint_add_volunteer = /** @type {(inputs: Exposure_Hint_Add_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This person will be able to read decrypted client data for any ticket they are assigned to. That data covers names, phone numbers, messages, and case notes. They can also export or copy it outside of CARE-Y. Only add people you trust with your clients' safety.`)
};

const es_exposure_hint_add_volunteer = /** @type {(inputs: Exposure_Hint_Add_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esta persona podrá leer datos descifrados de clientes para cualquier ticket que le sea asignado. Esos datos incluyen nombres, números de teléfono, mensajes y notas del caso. También puede exportar o copiar esa información fuera de CARE-Y. Solo agrega personas en quienes confíes la seguridad de tus clientes.`)
};

const en_xa2_exposure_hint_add_volunteer = /** @type {(inputs: Exposure_Hint_Add_VolunteerInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs pèrsòn wìll bè àblè tò rèàd dècryptèd clìènt dàtà fòr àny tìckèt thèy àrè àssìgnèd tò. Thàt dàtà còvèrs nàmès, phònè nùmbèrs, mèssàgès, ànd càsè nòtès. Thèy càn àlsò èxpòrt òr còpy ìt òùtsìdè òf CÀRÈ-Y. Ònly àdd pèòplè yòù trùst wìth yòùr clìènts' sàfèty. ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This person will be able to read decrypted client data for any ticket they are assigned to. That data covers names, phone numbers, messages, and case notes. ..." |
*
* @param {Exposure_Hint_Add_VolunteerInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const exposure_hint_add_volunteer = /** @type {((inputs?: Exposure_Hint_Add_VolunteerInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Exposure_Hint_Add_VolunteerInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_exposure_hint_add_volunteer(inputs)
	if (locale === "en-XA") return en_xa2_exposure_hint_add_volunteer(inputs)
	return en_exposure_hint_add_volunteer(inputs)
});