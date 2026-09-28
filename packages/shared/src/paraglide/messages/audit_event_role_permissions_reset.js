/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Role_Permissions_ResetInputs */

const en_audit_event_role_permissions_reset = /** @type {(inputs: Audit_Event_Role_Permissions_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role permissions reset to defaults`)
};

const es_audit_event_role_permissions_reset = /** @type {(inputs: Audit_Event_Role_Permissions_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permisos de rol restablecidos a los predeterminados`)
};

const en_xa2_audit_event_role_permissions_reset = /** @type {(inputs: Audit_Event_Role_Permissions_ResetInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròlè pèrmìssìòns rèsèt tò dèfàùlts •••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Role permissions reset to defaults" |
*
* @param {Audit_Event_Role_Permissions_ResetInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_role_permissions_reset = /** @type {((inputs?: Audit_Event_Role_Permissions_ResetInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Role_Permissions_ResetInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_role_permissions_reset(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_role_permissions_reset(inputs)
	return en_audit_event_role_permissions_reset(inputs)
});