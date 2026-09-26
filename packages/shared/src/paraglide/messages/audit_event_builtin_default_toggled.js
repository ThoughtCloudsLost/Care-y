/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Audit_Event_Builtin_Default_ToggledInputs */

const en_audit_event_builtin_default_toggled = /** @type {(inputs: Audit_Event_Builtin_Default_ToggledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Built-in default form toggled`)
};

const es_audit_event_builtin_default_toggled = /** @type {(inputs: Audit_Event_Builtin_Default_ToggledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`Formulario predeterminado integrado activado o desactivado`)
};

const en_xa2_audit_event_builtin_default_toggled = /** @type {(inputs: Audit_Event_Builtin_Default_ToggledInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Bùìlt-ìn dèfàùlt fòrm tògglèd •••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Built-in default form toggled" |
*
* @param {Audit_Event_Builtin_Default_ToggledInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const audit_event_builtin_default_toggled = /** @type {((inputs?: Audit_Event_Builtin_Default_ToggledInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Audit_Event_Builtin_Default_ToggledInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_audit_event_builtin_default_toggled(inputs)
	if (locale === "en-XA") return en_xa2_audit_event_builtin_default_toggled(inputs)
	return en_audit_event_builtin_default_toggled(inputs)
});