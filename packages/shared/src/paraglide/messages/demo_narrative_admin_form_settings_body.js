/* eslint-disable */
import { getLocale, experimentalStaticLocale } from '../runtime.js';

/** @typedef {import('../runtime.js').LocalizedString} LocalizedString */

/** @typedef {{}} Demo_Narrative_Admin_Form_Settings_BodyInputs */

const en_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`The settings block controls the form's identity and behavior.
**What the server holds.** The form name and public slug are stored as plaintext on the server because they carry no sensitive content, while the banner image is encrypted under a key derived from the organization's public key before upload.
**How it works.** Only one form can hold the default at a time, and the default is what web intake serves at the base URL when no slug is specified. The destination queue determines which queue receives tickets created through this form.
**Closing date.** When the closing date passes, the visitor sees the closed message, which falls back to a default if the organization has not written one. Leaving the date blank means the form stays open indefinitely.
**Share link.** The public URL is produced from the form's slug and requires no account to reach, and it does not exist until the form has been saved.`)
};

const es_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`El bloque de configuración controla la identidad y el comportamiento del formulario.
**Lo que almacena el servidor.** El nombre del formulario y el slug público se almacenan en texto plano en el servidor porque no contienen contenido sensible, mientras que la imagen de banner se cifra con una clave derivada de la clave pública de la organización antes de subirla.
**Cómo funciona.** Solo un formulario puede ser el predeterminado a la vez, y el predeterminado es lo que la admisión web sirve en la URL base cuando no se especifica un slug. La cola de destino determina qué cola recibe los tickets creados a través de este formulario.
**Fecha de cierre.** Cuando pasa la fecha de cierre, el visitante ve el mensaje de cierre, que recurre a un valor predeterminado si la organización no ha escrito uno. Dejar la fecha en blanco significa que el formulario permanece abierto indefinidamente.
**Enlace para compartir.** La URL pública se produce a partir del slug del formulario y no requiere cuenta para acceder, y no existe hasta que el formulario se ha guardado.`)
};

const en_xa2_demo_narrative_admin_form_settings_body = /** @type {(inputs: Demo_Narrative_Admin_Form_Settings_BodyInputs) => LocalizedString} */ () => {
	return /** @type {LocalizedString} */ (`⟦Thè sèttìngs blòck còntròls thè fòrm's ìdèntìty ànd bèhàvìòr.
 •••••••••••••••••••**Whàt thè sèrvèr hòlds. •••••••** Thè fòrm nàmè ànd pùblìc slùg àrè stòrèd às plàìntèxt òn thè sèrvèr bècàùsè thèy càrry nò sènsìtìvè còntènt, whìlè thè bànnèr ìmàgè ìs èncryptèd ùndèr à kèy dèrìvèd fròm thè òrgànìzàtìòn's pùblìc kèy bèfòrè ùplòàd.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Hòw ìt wòrks. ••••** Ònly ònè fòrm càn hòld thè dèfàùlt àt à tìmè, ànd thè dèfàùlt ìs whàt wèb ìntàkè sèrvès àt thè bàsè ÙRL whèn nò slùg ìs spècìfìèd. Thè dèstìnàtìòn qùèùè dètèrmìnès whìch qùèùè rècèìvès tìckèts crèàtèd thròùgh thìs fòrm.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Clòsìng dàtè. ••••** Whèn thè clòsìng dàtè pàssès, thè vìsìtòr sèès thè clòsèd mèssàgè, whìch fàlls bàck tò à dèfàùlt ìf thè òrgànìzàtìòn hàs nòt wrìttèn ònè. Lèàvìng thè dàtè blànk mèàns thè fòrm stàys òpèn ìndèfìnìtèly.
 •••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••**Shàrè lìnk. ••••** Thè pùblìc ÙRL ìs pròdùcèd fròm thè fòrm's slùg ànd rèqùìrès nò àccòùnt tò rèàch, ànd ìt dòès nòt èxìst ùntìl thè fòrm hàs bèèn sàvèd. •••••••••••••••••••••••••••••••••••••••••⟧`)
};

/**
* | output |
* | --- |
* | "The settings block controls the form's identity and behavior. **What the server holds.** The form name and public slug are stored as plaintext on the server ..." |
*
* @param {Demo_Narrative_Admin_Form_Settings_BodyInputs} inputs
* @param {{ locale?: "en" | "es" | "en-XA" }} options
* @returns {LocalizedString}
*/
export const demo_narrative_admin_form_settings_body = /** @type {((inputs?: Demo_Narrative_Admin_Form_Settings_BodyInputs, options?: { locale?: "en" | "es" | "en-XA" }) => LocalizedString) & import('../runtime.js').MessageMetadata<Demo_Narrative_Admin_Form_Settings_BodyInputs, { locale?: "en" | "es" | "en-XA" }, {}>} */ ((inputs = {}, options = {}) => {
	const locale = experimentalStaticLocale ?? options.locale ?? getLocale()
	if (locale === "es") return es_demo_narrative_admin_form_settings_body(inputs)
	if (locale === "en-XA") return en_xa2_demo_narrative_admin_form_settings_body(inputs)
	return en_demo_narrative_admin_form_settings_body(inputs)
});