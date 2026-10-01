/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{ days: NonNullable<unknown> }} Org_Deletion_DescriptionInputs */

const en_org_deletion_description = /** @type {(inputs: Org_Deletion_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Deleting this organization permanently erases all of its data, files and recordings. Deletion begins once a ${i?.days}-day waiting period has passed, and an administrator can stop it until then. Administrators are notified when a deletion is requested or stopped.`)
};

const es_org_deletion_description = /** @type {(inputs: Org_Deletion_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`Eliminar esta organización borra de forma permanente todos sus datos, archivos y grabaciones. La eliminación comienza cuando termina un periodo de espera de ${i?.days} días, y un administrador puede detenerla hasta entonces. Los administradores reciben un aviso cuando se solicita o se detiene una eliminación.`)
};

const en_xa2_org_deletion_description = /** @type {(inputs: Org_Deletion_DescriptionInputs) => LocalizedString} */ (i) => {
	return /** @type {LocalizedString} */ (`⟦Dèlètìng thìs òrgànìzàtìòn pèrmànèntly èràsès àll òf ìts dàtà, fìlès ànd rècòrdìngs. Dèlètìòn bègìns òncè à  •••••••••••••••••••••••••••••••••${i?.days}-dày wàìtìng pèrìòd hàs pàssèd, ànd àn àdmìnìstràtòr càn stòp ìt ùntìl thèn. Àdmìnìstràtòrs àrè nòtìfìèd whèn à dèlètìòn ìs rèqùèstèd òr stòppèd. ••••••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "Deleting this organization permanently erases all of its data, files and recordings. Deletion begins once a {days}-day waiting period has passed, and an admi..." |
*
* @param {Org_Deletion_DescriptionInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const org_deletion_description = /** @type {((inputs: Org_Deletion_DescriptionInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Org_Deletion_DescriptionInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_org_deletion_description(inputs)
	if (locale === "en-XA") return en_xa2_org_deletion_description(inputs)
	return en_org_deletion_description(inputs)
});