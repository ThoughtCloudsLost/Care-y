/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Role_Permission_ChangedInputs */

const en_audit_event_role_permission_changed = /** @type {(inputs: Audit_Event_Role_Permission_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Role permission changed`)
};

const es_audit_event_role_permission_changed = /** @type {(inputs: Audit_Event_Role_Permission_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Permiso de rol cambiado`)
};

const en_xa2_audit_event_role_permission_changed = /** @type {(inputs: Audit_Event_Role_Permission_ChangedInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Ròlè pèrmìssìòn chàngèd •••••••⟧`)
};

/**
* | output |
* | --- |
* | "Role permission changed" |
*
* @param {Audit_Event_Role_Permission_ChangedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_role_permission_changed = /** @type {((inputs?: Audit_Event_Role_Permission_ChangedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Role_Permission_ChangedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_role_permission_changed(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_role_permission_changed(inputs)
	return en_audit_event_role_permission_changed(inputs)
});