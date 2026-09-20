/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ name: NonNullable<unknown> }} Intake_Forms_Destination_Default_NamedInputs */

const en_intake_forms_destination_default_named = /** @type {(inputs: Intake_Forms_Destination_Default_NamedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Default intake queue (${i?.name})`)
};

const es_intake_forms_destination_default_named = /** @type {(inputs: Intake_Forms_Destination_Default_NamedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Cola de recepción predeterminada (${i?.name})`)
};

const en_xa2_intake_forms_destination_default_named = /** @type {(inputs: Intake_Forms_Destination_Default_NamedInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèfàùlt ìntàkè qùèùè ( •••••••${i?.name}) •⟧`)
};

/**
* | output |
* | --- |
* | "Default intake queue ({name})" |
*
* @param {Intake_Forms_Destination_Default_NamedInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const intake_forms_destination_default_named = /** @type {((inputs: Intake_Forms_Destination_Default_NamedInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Intake_Forms_Destination_Default_NamedInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_intake_forms_destination_default_named(inputs)
	if (locale === "en-XA") return en_xa2_intake_forms_destination_default_named(inputs)
	return en_intake_forms_destination_default_named(inputs)
});