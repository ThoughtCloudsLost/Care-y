/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Deactivate_BodyInputs */

const en_admin_deactivate_body = /** @type {(inputs: Admin_Deactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`They will be logged out immediately and lose access to organization data. To restore access later, you will need to reactivate their account and re-share the organization key.`)
};

const es_admin_deactivate_body = /** @type {(inputs: Admin_Deactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Se cerrará su sesión inmediatamente y perderá acceso a los datos de la organización. Para restaurar el acceso, deberá reactivar su cuenta y compartir la clave de organización nuevamente.`)
};

const en_xa2_admin_deactivate_body = /** @type {(inputs: Admin_Deactivate_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thèy wìll bè lòggèd òùt ìmmèdìàtèly ànd lòsè àccèss tò òrgànìzàtìòn dàtà. Tò rèstòrè àccèss làtèr, yòù wìll nèèd tò rèàctìvàtè thèìr àccòùnt ànd rè-shàrè thè òrgànìzàtìòn kèy. •••••••••••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "They will be logged out immediately and lose access to organization data. To restore access later, you will need to reactivate their account and re-share the..." |
*
* @param {Admin_Deactivate_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_body = /** @type {((inputs?: Admin_Deactivate_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Deactivate_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_deactivate_body(inputs)
	if (locale === "en-XA") return en_xa2_admin_deactivate_body(inputs)
	return en_admin_deactivate_body(inputs)
});