/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Admin_Deactivate_Sole_Holder_BodyInputs */

const en_admin_deactivate_sole_holder_body = /** @type {(inputs: Admin_Deactivate_Sole_Holder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Deactivating will permanently destroy access to those tickets. No one else can decrypt them, and no recovery path exists.`)
};

const es_admin_deactivate_sole_holder_body = /** @type {(inputs: Admin_Deactivate_Sole_Holder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Desactivar destruirá permanentemente el acceso a esos casos. Nadie más puede descifrarlos y no existe forma de recuperarlos.`)
};

const en_xa2_admin_deactivate_sole_holder_body = /** @type {(inputs: Admin_Deactivate_Sole_Holder_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Dèàctìvàtìng wìll pèrmànèntly dèstròy àccèss tò thòsè tìckèts. Nò ònè èlsè càn dècrypt thèm, ànd nò rècòvèry pàth èxìsts. •••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Deactivating will permanently destroy access to those tickets. No one else can decrypt them, and no recovery path exists." |
*
* @param {Admin_Deactivate_Sole_Holder_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const admin_deactivate_sole_holder_body = /** @type {((inputs?: Admin_Deactivate_Sole_Holder_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Admin_Deactivate_Sole_Holder_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_admin_deactivate_sole_holder_body(inputs)
	if (locale === "en-XA") return en_xa2_admin_deactivate_sole_holder_body(inputs)
	return en_admin_deactivate_sole_holder_body(inputs)
});