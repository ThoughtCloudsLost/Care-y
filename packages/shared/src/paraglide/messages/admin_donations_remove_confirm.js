/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Donations_Remove_ConfirmInputs */

const en_admin_donations_remove_confirm = /** @type {(inputs: Admin_Donations_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`This deletes the stored API key. Funds linked through this connection will show their raised total as unavailable until you link them again.`)
};

const es_admin_donations_remove_confirm = /** @type {(inputs: Admin_Donations_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Esto borra la clave de API guardada. Los fondos vinculados a través de esta conexión mostrarán su total recaudado como no disponible hasta que los vuelvas a vincular.`)
};

const en_xa2_admin_donations_remove_confirm = /** @type {(inputs: Admin_Donations_Remove_ConfirmInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thìs dèlètès thè stòrèd ÀPÌ kèy. Fùnds lìnkèd thròùgh thìs cònnèctìòn wìll shòw thèìr ràìsèd tòtàl às ùnàvàìlàblè ùntìl yòù lìnk thèm àgàìn. ••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "This deletes the stored API key. Funds linked through this connection will show their raised total as unavailable until you link them again." |
*
* @param {Admin_Donations_Remove_ConfirmInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_donations_remove_confirm = /** @type {((inputs?: Admin_Donations_Remove_ConfirmInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Donations_Remove_ConfirmInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_donations_remove_confirm(inputs)
	if (locale === "en-XA") return en_xa2_admin_donations_remove_confirm(inputs)
	return en_admin_donations_remove_confirm(inputs)
});